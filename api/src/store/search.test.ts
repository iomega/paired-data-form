import { loadJSONDocument } from '../util/io';
import { EXAMPLE_PROJECT_JSON_FN, mockedElasticSearchClient } from '../testhelpers';
import { SearchEngine, FilterField } from './search';
import { Client } from '@elastic/elasticsearch';
import { EnrichedProjectDocument } from './enrichments';
import { ConnectionError } from '@elastic/elasticsearch/lib/errors';
jest.mock('@elastic/elasticsearch');

const MockedClient: jest.Mock = Client as any;

describe('new SearchEngine()', () => {
    let searchEngine: SearchEngine;
    let client: any;

    beforeAll(async () => {
        client = await mockedElasticSearchClient();
        MockedClient.mockImplementation(() => client);
        searchEngine = new SearchEngine('http://localhost:9200');
    });

    describe('initialized without projects', () => {
        beforeAll(async () => {
            await searchEngine.initialize([]);
        });

        it('should have deleted an index', () => {
            expect(client.indices.delete).toHaveBeenCalledWith({
                index: 'podp',
                ignore_unavailable: true
            });
        });

        it('should have created an index', () => {
            expect(client.indices.create).toHaveBeenCalledWith({
                index: 'podp',
                body: expect.anything()
            });
        });
        it('should have not called client.bulk', () => {
            expect(client.bulk).not.toHaveBeenCalled();
        });

        describe('with a single genome project', () => {
            beforeEach(async () => {
                const eproject = await genomeProject();
                await searchEngine.add(eproject);
                const esproject = await esGenomeProject();
                client.search.mockReturnValue({
                    body: {
                        hits: {
                            hits: [{
                                _id: 'projectid1',
                                _score: 0.5,
                                _source: esproject
                            }],
                            total: {
                                value: 1
                            }
                        }
                    }
                });
            });

            it('should have called client.index', async () => {
                const project = await esGenomeProject();
                expect(client.index).toHaveBeenCalledWith({
                    index: 'podp',
                    id: project.project_id,
                    body: {
                        project_id: project.project_id,
                        project: project.project,
                        enrichments: project.enrichments,
                        summary: project.summary
                    }
                });
            });

            describe('the added document', () => {
                let doc: any;

                beforeEach(() => {
                    doc = client.index.mock.calls[0][0].body;
                });

                it('should have medium_title', () => {
                    const titles = doc.project.experimental.sample_preparation.map(
                        (d: any) => d.medium_details.medium_title
                    );
                    const expected_titles = ['A1 medium', 'R5 medium', 'Mannitol soy flour medium (MS)'];
                    expect(titles).toEqual(expected_titles);
                });

                it('should have instrument_title', () => {
                    const titles = doc.project.experimental.instrumentation_methods.map(
                        (d: any) => d.instrumentation.instrument_title
                    );
                    const expected_titles = ['Time-of-flight (TOF)'];
                    expect(titles).toEqual(expected_titles);
                });

                it('should have solvent_title', () => {
                    const titles: string[] = [];
                    doc.project.experimental.extraction_methods.forEach(
                        (m: any) => m.solvents.forEach(
                            (d: any) => titles.push(d.solvent_title)
                        )
                    );
                    const expected_titles = ['Ethyl acetate', 'Butanol', 'Methanol'];
                    expect(titles).toEqual(expected_titles);
                });

                it('should have array of genome enrichments', () => {
                    const expected = [{
                        label: 'Streptomyces sp. CNB091',
                        'species': {
                            'scientific_name': 'Streptomyces sp. CNB091',
                            'tax_id': 1169156
                        },
                        'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
                        'url': 'https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000'
                    }];
                    expect(doc.enrichments.genomes).toEqual(expected);
                });
            });

            describe('search()', () => {
                describe('defaults', () => {
                    let hits: any;

                    beforeEach(async () => {
                        hits = await searchEngine.search({});
                    });

                    it('should have called client.search', () => {
                        expect(client.search).toHaveBeenCalledWith({
                            index: 'podp',
                            size: 100,
                            from: 0,
                            _source: 'summary',
                            sort: 'summary.metabolite_id.keyword:desc',
                            body: {
                                'query': {
                                    match_all: {}
                                }
                            }
                        });
                    });

                    it('should return hits', async () => {
                        const expected_project = await genomeProjectSummary();
                        const expected = {
                            data: [expected_project],
                            total: 1
                        };
                        expect(hits).toEqual(expected);
                    });
                });

                describe('paging', () => {
                    let hits: any;

                    beforeEach(async () => {
                        hits = await searchEngine.search({ size: 1, from: 2 });
                    });

                    it('should have called client.search', () => {
                        expect(client.search).toHaveBeenCalledWith({
                            index: 'podp',
                            size: 1,
                            from: 2,
                            _source: 'summary',
                            sort: 'summary.metabolite_id.keyword:desc',
                            body: {
                                'query': {
                                    match_all: {}
                                }
                            }
                        });
                    });

                    it('should return hits', async () => {
                        const expected_project = await genomeProjectSummary();
                        const expected = {
                            data: [expected_project],
                            total: 1
                        };
                        expect(hits).toEqual(expected);
                    });
                });

                describe('query=\'Justin\'', () => {
                    const query = 'Justin';
                    let hits: any;

                    beforeEach(async () => {
                        hits = await searchEngine.search({ query });
                    });

                    it('should have called client.search', () => {
                        expect(client.search).toHaveBeenCalledWith({
                            index: 'podp',
                            from: 0,
                            size: 100,
                            _source: 'summary',
                            body: {
                                'query': {
                                    simple_query_string: {
                                        query
                                    }
                                }
                            }
                        });
                    });

                    it('should return hits', async () => {
                        const expected_project = await genomeProjectSummary();
                        const expected = {
                            data: [expected_project],
                            total: 1
                        };
                        expect(hits).toEqual(expected);
                    });
                });

                describe.each([
                    ['principal_investigator', 'Marnix Medema'],
                    ['submitter', 'Justin van der Hooft'],
                    ['genome_type', 'genome'],
                    ['species', 'Streptomyces sp. CNB091'],
                    ['metagenomic_environment', 'Soil'],
                    ['instrument_type', 'Time-of-flight (TOF)'],
                    ['growth_medium', 'A1 medium'],
                    ['solvent', 'Butanol'],
                    ['ionization_mode', 'Positive'],
                    ['ionization_type', 'Electrospray Ionization (ESI)'],
                    ['proteome_type', 'Full proteome'],
                    ['proteome_type', 'Enriched: PKS machinery'],
                    ['proteome_type', 'Enriched: PKS machinery, some target'],
                ])('filter={key:\'%s\', value:\'%s\'}', (key: FilterField, value) => {
                    let hits: any;
                    beforeEach(async () => {
                        client.search.mockClear();
                        hits = await searchEngine.search({ filter: { key, value } });
                    });

                    it('should have called index.search', () => {
                        expect(client.search).toBeCalled();
                        const called = client.search.mock.calls[0][0];
                        const expected = {
                            index: 'podp',
                            from: 0,
                            size: 100,
                            _source: 'summary',
                            body: {
                                query: {
                                    match: expect.anything()
                                }
                            }
                        };
                        expect(called).toEqual(expected);
                    });

                    it('should return hits', async () => {
                        const expected_project = await genomeProjectSummary();
                        const expected = {
                            data: [expected_project],
                            total: 1
                        };
                        expect(hits).toEqual(expected);
                    });
                });

                describe('invalid filter field', () => {
                    it('should throw Error', async () => {
                        expect.assertions(1);
                        try {
                            await searchEngine.search({
                                filter: {
                                    key: 'some invalid key' as any,
                                    value: 'somevalue'
                                }
                            });
                        } catch (error) {
                            expect(error).toEqual(new Error('Invalid filter field'));
                        }
                    });
                });

                describe('filter & query', () => {
                    it('should have called index.search', async () => {
                        client.search.mockClear();
                        const query = 'Justin';
                        const filter = { key: 'solvent' as FilterField, value: 'Butanol' };

                        await searchEngine.search({ query, filter });

                        expect(client.search).toBeCalled();
                        const called = client.search.mock.calls[0][0];
                        const expected = {
                            index: 'podp',
                            from: 0,
                            size: 100,
                            _source: 'summary',
                            body: {
                                query: {
                                    bool: {
                                        must: {
                                            simple_query_string: {
                                                query: 'Justin'
                                            }
                                        },
                                        filter: {
                                            match: {
                                                'project.experimental.extraction_methods.solvents.solvent_title.keyword': 'Butanol'
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        expect(called).toEqual(expected);
                    });

                });
            });

            describe('delete(\projectid1\')', () => {
                it('should have called client.delete', async () => {
                    await searchEngine.delete('projectid1');

                    expect(client.delete).toHaveBeenCalledWith({
                        id: 'projectid1',
                        index: 'podp',
                    });
                });
            });

        });

        describe('with a single metagenome project', () => {
            beforeAll(async () => {
                const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
                project.experimental.sample_preparation = [{
                    'medium_details': {
                        'medium_type': 'metagenome',
                        'metagenomic_environment': 'https://bioportal.bioontology.org/ontologies/MEO/?p=classes&conceptid=http%3A%2F%2Fpurl.jp%2Fbio%2F11%2Fmeo%2FMEO_0000393',
                        'metagenomic_sample_description': 'American gut subject'
                    },
                    'growth_parameters': {
                        'growth_phase_OD': 'NA'
                    },
                    'aeration': {
                        'aeration_type': 'not shaking'
                    },
                    'sample_preparation_method': 'Metagenome'
                }];
                const eproject = {
                    _id: 'projectid1',
                    project,
                };
                client.index.mockClear();
                await searchEngine.add(eproject);
            });

            describe('the added document', () => {
                let doc: any;

                beforeAll(() => {
                    doc = client.index.mock.calls[0][0].body;
                });

                it('should have metagenomic_environment_title', async () => {
                    const titles = doc.project.experimental.sample_preparation.map(
                        (d: any) => d.medium_details.metagenomic_environment_title
                    );
                    const expected_titles = ['Human'];
                    expect(titles).toEqual(expected_titles);
                });
            });
        });

        describe('addMany()', () => {
            it('should have called client.bulk', async () => {
                client.bulk.mockClear();
                const eproject = await genomeProject();
                await searchEngine.addMany([eproject]);

                const expected = {
                    body: [{
                        'index': {
                            '_id': 'projectid1',
                            '_index': 'podp',
                        }
                    }, expect.anything()]
                };
                expect(client.bulk).toHaveBeenCalledWith(expected);
            });
        });

    });

    describe('health()', () => {
        describe('when cluster and index are mocked green', () => {
            beforeEach(() => {
                client.cluster.health.mockResolvedValue({
                    body: {
                        status: 'green',
                        indices: {
                            podp: {
                                status: 'green',
                            }
                        }
                    }
                });
            });
            it('should return true', async () => {
                expect(await searchEngine.health()).toBeTruthy();
            });
        });

        describe('when cluster and index are mocked red', () => {
            beforeEach(() => {
                client.cluster.health.mockResolvedValue({
                    body: {
                        status: 'red',
                        indices: {
                            podp: {
                                status: 'red',
                            }
                        }
                    }
                });
            });
            it('should return false', async () => {
                expect(await searchEngine.health()).toBeFalsy();
            });
        });

        describe('when cluster is green, but index missing', () => {
            beforeEach(() => {
                client.cluster.health.mockResolvedValue({
                    body: {
                        status: 'red',
                        indices: {
                        }
                    }
                });
            });
            it('should return false', async () => {
                expect(await searchEngine.health()).toBeFalsy();
            });
        });

        describe('when cluster is offline', () => {
            beforeEach(() => {
                client.cluster.health.mockRejectedValue(new ConnectionError('getaddrinfo EAI_AGAIN search', undefined));
            });
            it('should return false', async () => {
                expect(await searchEngine.health()).toBeFalsy();
            });
        });
    });
});

async function esGenomeProject() {
    // Project as indexed in elastic search
    const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
    project.experimental.sample_preparation[0].medium_details.medium_title = 'A1 medium';
    project.experimental.sample_preparation[1].medium_details.medium_title = 'R5 medium';
    project.experimental.sample_preparation[2].medium_details.medium_title = 'Mannitol soy flour medium (MS)';
    project.experimental.extraction_methods[0].solvents[0].solvent_title = 'Ethyl acetate';
    project.experimental.extraction_methods[1].solvents[0].solvent_title = 'Butanol';
    project.experimental.extraction_methods[2].solvents[0].solvent_title = 'Methanol';
    project.experimental.instrumentation_methods[0].instrumentation.instrument_title = 'Time-of-flight (TOF)';
    project.experimental.instrumentation_methods[0].mode_title = 'Positive';
    project.experimental.instrumentation_methods[0].ionization_type_title = 'Electrospray Ionization (ESI)';
    const esproject = {
        project_id: 'projectid1',
        project,
        enrichments: {
            genomes: [{
                label: 'Streptomyces sp. CNB091',
                'species': {
                    'scientific_name': 'Streptomyces sp. CNB091',
                    'tax_id': 1169156
                },
                'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
                'url': 'https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000'
            }]
        },
        summary: {
            metabolite_id: 'MSV000078839',
            PI_name: 'Marnix Medema',
            submitters: 'Justin van der Hooft',
            nr_extraction_methods: 3,
            nr_genecluster_mspectra_links: 3,
            nr_genome_metabolomics_links: 21,
            nr_genomes: 3,
            nr_proteomes: 0,
            nr_growth_conditions: 3,
            nr_instrumentation_methods: 1,
        }
    };
    return esproject;
}

async function genomeProject() {
    const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
    const eproject = {
        _id: 'projectid1',
        project,
        enrichments: {
            genomes: {
                'Streptomyces sp. CNB091': {
                    'species': {
                        'scientific_name': 'Streptomyces sp. CNB091',
                        'tax_id': 1169156
                    },
                    'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
                    'url': 'https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000'
                }
            }
        }
    };
    return eproject as EnrichedProjectDocument;
}

async function genomeProjectSummary() {
    const summary = {
        _id: 'projectid1',
        metabolite_id: 'MSV000078839',
        PI_name: 'Marnix Medema',
        submitters: 'Justin van der Hooft',
        nr_extraction_methods: 3,
        nr_genecluster_mspectra_links: 3,
        nr_genome_metabolomics_links: 21,
        nr_genomes: 3,
        nr_proteomes: 0,
        nr_growth_conditions: 3,
        nr_instrumentation_methods: 1,
        score: 0.5,
    };
    return summary;
}
