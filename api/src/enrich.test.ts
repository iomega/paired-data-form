jest.mock('node-fetch');

import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

import { enrich } from './enrich';
import { IOMEGAPairedDataPlatform } from './schema';

describe('enrich()', () => {
    describe('Genome with genbank accession', () => {
        let project: IOMEGAPairedDataPlatform;
        beforeEach(() => {
            project = {
                version: '1',
                personal: {},
                genomes: [{
                    'genome_ID': {
                        'genome_type': 'genome',
                        'GenBank_accession': 'ARJI01000000'
                    },
                    'genome_label': 'Streptomyces sp. CNB091'
                }],
                metabolomics: {
                    GNPSMassIVE_ID: 'MSV000078839',
                    MaSSIVE_URL: 'https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=a507232a787243a5afd69a6c6fa1e508'
                },
                experimental: {},
                genome_metabolome_links: []
            };
            ((fetch as any) as jest.Mock).mockImplementation((url) => {
                if (url === 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nuccore&id=ARJI01000000&retmode=json') {
                    const resp = {
                        'header': {
                            'type': 'esummary',
                            'version': '0.3'
                        },
                        'result': {
                            'uids': [
                                '481754485'
                            ],
                            '481754485': {
                                'uid': '481754485',
                                'caption': 'ARJI00000000',
                                'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
                                'extra': 'gi|481754485|gb|ARJI00000000.1|ARJI01000000',
                                'gi': 481754485,
                                'createdate': '2013/04/22',
                                'updatedate': '2013/12/12',
                                'flags': '',
                                'taxid': 1169156,
                                'slen': 57,
                                'biomol': 'genomic',
                                'moltype': 'dna',
                                'topology': 'linear',
                                'sourcedb': 'insd',
                                'segsetsize': '',
                                'projectid': '178488',
                                'genome': '',
                                'subtype': 'strain',
                                'subname': 'CNB091',
                                'assemblygi': '',
                                'assemblyacc': '',
                                'tech': 'wgs',
                                'completeness': '',
                                'geneticcode': '11',
                                'strand': '',
                                'organism': 'Streptomyces sp. CNB091',
                                'strain': 'CNB091',
                                'biosample': 'SAMN02441673',
                                'statistics': [
                                    {
                                        'type': 'all',
                                        'count': 1
                                    },
                                    {
                                        'type': 'blob_size',
                                        'count': 4394
                                    },
                                    {
                                        'type': 'org',
                                        'count': 1
                                    },
                                    {
                                        'type': 'pub',
                                        'count': 1
                                    },
                                    {
                                        'source': 'all',
                                        'type': 'all',
                                        'count': 1
                                    },
                                    {
                                        'source': 'all',
                                        'type': 'blob_size',
                                        'count': 4394
                                    },
                                    {
                                        'source': 'all',
                                        'type': 'org',
                                        'count': 1
                                    },
                                    {
                                        'source': 'all',
                                        'type': 'pub',
                                        'count': 1
                                    }
                                ],
                                'properties': {
                                    'na': '1',
                                    'master': '1',
                                    'value': '1'
                                },
                                'oslt': {
                                    'indexed': true,
                                    'value': 'ARJI00000000.1'
                                },
                                'accessionversion': 'ARJI00000000.1'
                            }
                        }
                    };
                    return Promise.resolve(new Response(JSON.stringify(resp)));
                }
                return Promise.reject(new Error('URL not mocked'));
            });
        });

        it('should have enriched genome', async () => {
            expect.assertions(1);

            const enrichment = await enrich(project);

            const enriched_genome = enrichment.genomes[0];
            const expected = {
                'species': {
                    'scientific_name': 'Streptomyces sp. CNB091',
                    'tax_id': 1169156
                },
                'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
                'url': 'https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000'
            };
            expect(enriched_genome).toEqual(expected);
        });
    });

    describe('Genome with bogus genbank accession', () => {
        let project: IOMEGAPairedDataPlatform;
        beforeEach(() => {
            project = {
                version: '1',
                personal: {},
                genomes: [{
                    'genome_ID': {
                        'genome_type': 'genome',
                        'GenBank_accession': 'IAMNOTCORRECT'
                    },
                    'genome_label': 'Some label'
                }],
                metabolomics: {
                    GNPSMassIVE_ID: 'MSV000078839',
                    MaSSIVE_URL: 'https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=a507232a787243a5afd69a6c6fa1e508'
                },
                experimental: {},
                genome_metabolome_links: []
            };
            ((fetch as any) as jest.Mock).mockImplementation((url) => {
                if (url === 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nuccore&id=IAMNOTCORRECT&retmode=json') {
                    const resp: any = {
                        'header': {
                            'type': 'esummary',
                            'version': '0.3'
                        },
                        'error': 'Invalid uid IAMNOTCORRECT at position=0',
                        'result': {
                            'uids': [
                            ]
                        }
                    };
                    return Promise.resolve(new Response(JSON.stringify(resp)));
                }
                return Promise.reject(new Error('URL not mocked'));
            });
        });

        it('should have non enriched genome', async () => {
            expect.assertions(1);

            const enrichment = await enrich(project);

            const enriched_genome = enrichment.genomes[0];
            const expected = {
            };
            expect(enriched_genome).toEqual(expected);
        });
    });
});