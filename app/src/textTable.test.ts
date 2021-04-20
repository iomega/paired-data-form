import { kitchenSinkDoc, minimalDoc } from './test.fixtures';
import { jsonDocument, textTable, tsvUrl } from './textTable';
import { IOMEGAPairedOmicsDataPlatform } from './schema';

describe('with schema loaded', () => {
    let schema: any;
    beforeEach(() => {
        schema = require('../public/schema.json');
    });

    describe('textTable', () => {
        it('should convert minimal json doc to text table', () => {
            const table = textTable(schema, minimalDoc);
            const expected = [
                ['Genome/Metagenome', 'Proteome', 'Location of metabolomics data file', 'Sample Growth Conditions', 'Extraction Method', 'Instrumentation Method']
            ];
            expect(table).toEqual(expected);
        });

        it('should convert kitchen sick', () => {
            const table = textTable(schema, kitchenSinkDoc);
            const expected = [
                [
                    'Genome/Metagenome', 'Proteome', 'Location of metabolomics data file', 'Sample Growth Conditions', 'Extraction Method', 'Instrumentation Method'
                ],
                [
                    'Streptomyces sp. CNB091', undefined, 'ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML',
                    'agar', 'meth', 'quad'
                ],
                [
                    'Streptomyces sp. CNB091',
                    undefined,
                    'ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2',
                    'blod',
                    'beer',
                    'bh'
                ]
            ];
            expect(table).toEqual(expected);
        });
    });

    describe('jsonDocument', () => {
        it('should convert header only table to zero links', () => {
            const table: any[] = [];
            const genome_metabolome_links = jsonDocument(kitchenSinkDoc, table);
            expect(genome_metabolome_links).toEqual([]);
        })

        function arrayParse(header: string[], rows: any[][]) {
            return rows.map(r => {
                const row: any = {};
                r.forEach((c: any, i: number) => {
                    row[header[i]] = c;
                })
                return row;
            });
        }

        it('should convert a single link with minimal fields text table to json doc', () => {
            const header = [
                'Genome/Metagenome', 'Proteome', 'Location of metabolomics data file', 'Sample Growth Conditions', 'Extraction Method', 'Instrumentation Method'
            ];
            const rows = [
                ["Streptomyces sp. CNB091", undefined, "ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2", "agar", "beer", "bh"]
            ];
            const table = arrayParse(header, rows);
            const doc = jsonDocument(kitchenSinkDoc, table);
            const expected = [{
                "extraction_method_label": "beer",
                "genome_label": "Streptomyces sp. CNB091",
                "instrumentation_method_label": "bh",
                "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2",
                "sample_preparation_label": "agar"
            }];
            expect(doc).toEqual(expected);
        });

        it.each([
            ['No genomes or metagenomes have been defined', {}, []],
            ['No sample growth conditions have been defined in the metabolomics experimental details section', {
                genomes: [{
                    "genome_ID": {
                        "genome_type": "genome",
                        "GenBank_accession": "ARJI01000000"
                    },
                    "genome_label": "CNB091"
                }],
                experimental: {}
            }, []],
            ['No extraction methods have been defined in the metabolomics experimental details section', {
                genomes: [{
                    "genome_ID": {
                        "genome_type": "genome",
                        "GenBank_accession": "ARJI01000000"
                    },
                    "genome_label": "CNB091"
                }],
                experimental: {
                    sample_preparation: [{
                        "medium_details": {
                            "medium_type": "liquid",
                            "medium": "other",
                            "Other_medium": "blood"
                        },
                        "growth_parameters": {
                            "growth_temperature": 1
                        },
                        "aeration": {
                            "aeration_type": "not shaking"
                        },
                        "sample_preparation_method": "blod"
                    }]
                }
            }, []],
            ['No instrumentation methods have been defined in the metabolomics experimental details section', {
                genomes: [{
                    "genome_ID": {
                        "genome_type": "genome",
                        "GenBank_accession": "ARJI01000000"
                    },
                    "genome_label": "CNB091"
                }],
                experimental: {
                    sample_preparation: [{
                        "medium_details": {
                            "medium_type": "liquid",
                            "medium": "other",
                            "Other_medium": "blood"
                        },
                        "growth_parameters": {
                            "growth_temperature": 1
                        },
                        "aeration": {
                            "aeration_type": "not shaking"
                        },
                        "sample_preparation_method": "blod"
                    }],
                    extraction_methods: [{
                        "solvents": [
                            {
                                "solvent": "http://purl.obolibrary.org/obo/CHEBI_17790",
                                "ratio": 1
                            }
                        ],
                        "extraction_method": "meth"
                    }]
                }
            }, []],
            ["'Location of metabolomics data file','Genome/Metagenome','Sample Growth Conditions','Extraction Method','Instrumentation Method' columns are missing", kitchenSinkDoc, [{foo: 'bar'}]],
            ['badlabel is not known as genome label, please add the (meta)genome first', kitchenSinkDoc, [{
                'Genome/Metagenome': 'badlabel',
                'Location of metabolomics data file': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/A1/CNB091_A1_B.mzXML',
                'Sample Growth Conditions': 'blod',
                'Extraction Method': 'meth',
                'Instrumentation Method': 'bh',
            }]],
            ['badlabel is not known as Sample Growth Conditions label, please add the sample growth condition first', kitchenSinkDoc, [{
                'Genome/Metagenome': 'Streptomyces sp. CNB091',
                'Location of metabolomics data file': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/A1/CNB091_A1_B.mzXML',
                'Sample Growth Conditions': 'badlabel',
                'Extraction Method': 'meth',
                'Instrumentation Method': 'bh',
            }]],
            ['badlabel is not known as extraction method label, please add the extraction method first', kitchenSinkDoc, [{
                'Genome/Metagenome': 'Streptomyces sp. CNB091',
                'Location of metabolomics data file': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/A1/CNB091_A1_B.mzXML',
                'Sample Growth Conditions': 'blod',
                'Extraction Method': 'badlabel',
                'Instrumentation Method': 'bh',
            }]],
            ['badlabel is not known as instrumentation method label, please add the instrumation method first', kitchenSinkDoc, [{
                'Genome/Metagenome': 'Streptomyces sp. CNB091',
                'Location of metabolomics data file': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/A1/CNB091_A1_B.mzXML',
                'Sample Growth Conditions': 'blod',
                'Extraction Method': 'meth',
                'Instrumentation Method': 'badlabel',
            }]],
        ])('should complain about %s', (message, project, rows) => {
            expect(() => jsonDocument(project as IOMEGAPairedOmicsDataPlatform, rows)).toThrowError(message);
        });
    });

    describe('tsvUrl', () => {
        it('should render doc with no links as just header', () => {
            const doc = {
                "version": "3",
                "personal": {},
                "metabolomics": {
                    "project": {
                        "GNPSMassIVE_ID": "MSV000078839",
                        "MaSSIVE_URL": "https://gnps.ucsd.edu/ProteoSAFe/result.jsp?task=a507232a787243a5afd69a6c6fa1e508&view=advanced_view"
                    }
                },
                "genomes": [],
                "experimental": {},
                "genome_metabolome_links": []
            };
            const url = tsvUrl(schema, doc);
            const expected = 'data:text/tab-separated-values;base64,R2Vub21lL01ldGFnZW5vbWUJUHJvdGVvbWUJTG9jYXRpb24gb2YgbWV0YWJvbG9taWNzIGRhdGEgZmlsZQlTYW1wbGUgR3Jvd3RoIENvbmRpdGlvbnMJRXh0cmFjdGlvbiBNZXRob2QJSW5zdHJ1bWVudGF0aW9uIE1ldGhvZA==';
            expect(url).toEqual(expected);
        });
    })
});
