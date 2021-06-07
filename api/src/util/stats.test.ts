import { loadJSONDocument } from './io';
import { computeStats, IStats } from './stats';
import { IOMEGAPairedOmicsDataPlatform } from '../schema';
import { ProjectEnrichments } from '../enrich';
import { EXAMPLE_PROJECT_JSON_FN } from '../testhelpers';
import { loadSchema } from './schema';
jest.mock('../projectdocumentstore');


describe('computeStats()', () => {

    describe('with schema', () => {
        let schema: object;

        beforeAll(() => {
            schema = loadSchema();
        });

        describe('with example un-enriched project', () => {
            let project: IOMEGAPairedOmicsDataPlatform;

            beforeEach(async () => {
                project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
            });

            it('should have stats', () => {
                const projects = [{
                    _id: '08a05264-7f06-4821-b4ad-bfd4ecb3bd34.1',
                    project
                }];
                const result = computeStats(projects, schema);

                const expected: IStats = {
                    'global': {
                        'projects': 1,
                        'principal_investigators': 1,
                        'metabolome_samples': 21,
                        'bgc_ms2': 3,
                    },
                    'top': {
                        'principal_investigators': [
                            ['Marnix Medema', 1]
                        ],
                        'submitters': [
                            ['Justin van der Hooft', 1]
                        ],
                        'genome_types': [
                            ['genome', 3]
                        ],
                        'instrument_types': [
                            ['Time-of-flight (TOF)', 1]
                        ],
                        'ionization_modes': [
                            ['Positive', 1]
                        ],
                        'growth_media': [
                            ['A1 medium', 1],
                            ['R5 medium', 1],
                            ['Mannitol soy flour medium (MS)', 1]
                        ],
                        'solvents': [
                            ['Ethyl acetate', 1],
                            ['Butanol', 1],
                            ['Methanol', 1]
                        ],
                        'species': [
                            ['Streptomyces sp. CNB091', 1],
                            ['Streptomyces sp. CNH099', 1],
                            ['Salinispora arenicola CNB527', 1]
                        ],
                        'metagenomic_environment': [],
                        'proteome_types': [],
                    }
                };
                expect(result).toEqual(expected);
            });

            describe('with enrichment', () => {
                let enrichments: ProjectEnrichments;

                beforeEach(() => {
                    enrichments = {
                        'genomes': {
                            'Streptomyces sp. CNB091': {
                                'url': 'https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000',
                                'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
                                'species': {
                                    'tax_id': 1169156,
                                    // project already uses NCBI taxonomies scientific name,
                                    // change here to make sure species comes from enrichment
                                    'scientific_name': 'XStreptomyces sp. CNB091'
                                }
                            },
                            'Streptomyces sp. CNH099': {
                                'url': 'https://www.ncbi.nlm.nih.gov/nuccore/AZWL01000000',
                                'title': 'Streptomyces sp. CNH099, whole genome shotgun sequencing project',
                                'species': {
                                    'tax_id': 1137269,
                                    'scientific_name': 'YStreptomyces sp. CNH099'
                                }
                            },
                            'Salinispora arenicola CNB527': {
                                'url': 'https://www.ncbi.nlm.nih.gov/nuccore/AZXI01000001',
                                'title': 'Salinispora arenicola CNB527 B033DRAFT_scaffold_0.1_C, whole genome shotgun sequence',
                                'species': {
                                    'tax_id': 1137250,
                                    'scientific_name': 'ZSalinispora arenicola CNB527'
                                }
                            }
                        }
                    };
                });

                it('should have stats', () => {
                    const projects = [{
                        _id: '08a05264-7f06-4821-b4ad-bfd4ecb3bd34.1',
                        project,
                        enrichments
                    }];
                    const result = computeStats(projects, schema);

                    const expected: IStats = {
                        'global': {
                            'projects': 1,
                            'principal_investigators': 1,
                            'metabolome_samples': 21,
                            'bgc_ms2': 3
                        },
                        'top': {
                            'principal_investigators': [
                                ['Marnix Medema', 1]
                            ],
                            'submitters': [
                                ['Justin van der Hooft', 1]
                            ],
                            'genome_types': [
                                ['genome', 3]
                            ],
                            'instrument_types': [
                                ['Time-of-flight (TOF)', 1]
                            ],
                            'ionization_modes': [
                                ['Positive', 1]
                            ],
                            'growth_media': [
                                ['A1 medium', 1],
                                ['R5 medium', 1],
                                ['Mannitol soy flour medium (MS)', 1]
                            ],
                            'solvents': [
                                ['Ethyl acetate', 1],
                                ['Butanol', 1],
                                ['Methanol', 1]
                            ], 'species': [
                                ['XStreptomyces sp. CNB091', 1],
                                ['YStreptomyces sp. CNH099', 1],
                                ['ZSalinispora arenicola CNB527', 1]
                            ],
                            'metagenomic_environment': [],
                            'proteome_types': [],
                        }
                    };
                    expect(result).toEqual(expected);
                });
            });

            describe('with secondary submitter', () => {
                beforeEach(async () => {
                    project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
                    project.personal.submitter_email_secondary = 's.verhoeven@esciencecenter.nl';
                    project.personal.submitter_name_secondary = 'Stefan Verhoeven';
                });

                it('should have stats', () => {
                    const projects = [{
                        _id: '08a05264-7f06-4821-b4ad-bfd4ecb3bd34.1',
                        project
                    }];
                    const result = computeStats(projects, schema);

                    const expected: IStats = {
                        'global': {
                            'projects': 1,
                            'principal_investigators': 1,
                            'metabolome_samples': 21,
                            'bgc_ms2': 3,
                        },
                        'top': {
                            'principal_investigators': [
                                ['Marnix Medema', 1]
                            ],
                            'submitters': [
                                ['Justin van der Hooft', 1],
                                ['Stefan Verhoeven', 1]
                            ],
                            'genome_types': [
                                ['genome', 3]
                            ],
                            'instrument_types': [
                                ['Time-of-flight (TOF)', 1]
                            ],
                            'ionization_modes': [
                                ['Positive', 1]
                            ],
                            'growth_media': [
                                ['A1 medium', 1],
                                ['R5 medium', 1],
                                ['Mannitol soy flour medium (MS)', 1]
                            ],
                            'solvents': [
                                ['Ethyl acetate', 1],
                                ['Butanol', 1],
                                ['Methanol', 1]
                            ],
                            'species': [
                                ['Streptomyces sp. CNB091', 1],
                                ['Streptomyces sp. CNH099', 1],
                                ['Salinispora arenicola CNB527', 1]
                            ],
                            'metagenomic_environment': [],
                            'proteome_types': [],
                        }
                    };
                    expect(result).toEqual(expected);
                });
            });

            describe('with full proteome', () => {
                beforeEach(async () => {
                    project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
                    project.proteomes = [{
                        proteome_ID: {
                            proteome_type: 'Full proteome'
                        },
                        raw_data: {
                            database: {
                                database_name: 'ProteomeXchange'
                            },
                            proteome_data_link: 'http://central.proteomexchange.org/cgi/GetDataset?ID=PXD013683'
                        },
                        method: {
                            analysis_mode: 'Data-dependent acquisition (DDA)',
                            peptide_labelling: 'iTRAQ'
                        },
                        experimental_details: {},
                        more_info: {},
                        proteome_label: 'someprotlabel'
                    }];
                });

                it('should have stats', () => {
                    const projects = [{
                        _id: '08a05264-7f06-4821-b4ad-bfd4ecb3bd34.1',
                        project
                    }];
                    const result = computeStats(projects, schema);

                    const expected: IStats = {
                        'global': {
                            'projects': 1,
                            'principal_investigators': 1,
                            'metabolome_samples': 21,
                            'bgc_ms2': 3,
                        },
                        'top': {
                            'principal_investigators': [
                                ['Marnix Medema', 1]
                            ],
                            'submitters': [
                                ['Justin van der Hooft', 1]
                            ],
                            'genome_types': [
                                ['genome', 3]
                            ],
                            'instrument_types': [
                                ['Time-of-flight (TOF)', 1]
                            ],
                            'ionization_modes': [
                                ['Positive', 1]
                            ],
                            'growth_media': [
                                ['A1 medium', 1],
                                ['R5 medium', 1],
                                ['Mannitol soy flour medium (MS)', 1]
                            ],
                            'solvents': [
                                ['Ethyl acetate', 1],
                                ['Butanol', 1],
                                ['Methanol', 1]
                            ],
                            'species': [
                                ['Streptomyces sp. CNB091', 1],
                                ['Streptomyces sp. CNH099', 1],
                                ['Salinispora arenicola CNB527', 1]
                            ],
                            'metagenomic_environment': [],
                            'proteome_types': [
                                ['Full proteome', 1]
                            ],
                        }
                    };
                    expect(result).toEqual(expected);
                });
            });

            describe('with custom enriched proteome', () => {
                beforeEach(async () => {
                    project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
                    project.proteomes = [{
                        proteome_ID: {
                            proteome_type: 'Enriched',
                            targets: [{
                                target: 'pks',
                            }, {
                                target: 'other',
                                other_target: 'Some other target'
                            }]
                        },
                        raw_data: {
                            database: {
                                database_name: 'ProteomeXchange'
                            },
                            proteome_data_link: 'http://central.proteomexchange.org/cgi/GetDataset?ID=PXD013683'
                        },
                        method: {
                            analysis_mode: 'Data-dependent acquisition (DDA)',
                            peptide_labelling: 'iTRAQ'
                        },
                        experimental_details: {},
                        more_info: {},
                        proteome_label: 'someprotlabel'
                    }];
                });

                it('should have stats', () => {
                    const projects = [{
                        _id: '08a05264-7f06-4821-b4ad-bfd4ecb3bd34.1',
                        project
                    }];

                    const result = computeStats(projects, schema);

                    const expected: IStats = {
                        'global': {
                            'projects': 1,
                            'principal_investigators': 1,
                            'metabolome_samples': 21,
                            'bgc_ms2': 3,
                        },
                        'top': {
                            'principal_investigators': [
                                ['Marnix Medema', 1]
                            ],
                            'submitters': [
                                ['Justin van der Hooft', 1]
                            ],
                            'genome_types': [
                                ['genome', 3]
                            ],
                            'instrument_types': [
                                ['Time-of-flight (TOF)', 1]
                            ],
                            'ionization_modes': [
                                ['Positive', 1]
                            ],
                            'growth_media': [
                                ['A1 medium', 1],
                                ['R5 medium', 1],
                                ['Mannitol soy flour medium (MS)', 1]
                            ],
                            'solvents': [
                                ['Ethyl acetate', 1],
                                ['Butanol', 1],
                                ['Methanol', 1]
                            ],
                            'species': [
                                ['Streptomyces sp. CNB091', 1],
                                ['Streptomyces sp. CNH099', 1],
                                ['Salinispora arenicola CNB527', 1]
                            ],
                            'metagenomic_environment': [],
                            'proteome_types': [
                                ['Enriched: PKS machinery, Some other target', 1]
                            ],
                        }
                    };
                    expect(result).toEqual(expected);
                });
            });
        });
    });
});
