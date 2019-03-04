import { kitchenSinkDoc, minimalDoc } from './test.fixtures';
import { jsonDocument, textTable, tsvUrl } from './textTable';

describe('with schema loaded', () => {
    let schema: any;
    beforeEach(() => {
        schema = require('../public/schema.json');
    });

    describe('textTable', () => {
        it('should convert minimal json doc to text table', () => {
            const table = textTable(schema, minimalDoc);
            const expected = [
                ["Location of metabolomics data file", "Genome or Metagenome", "GenBank accession number", "RefSeq accession number", "ENA/NCBI accession number", "MGnify accession number", "BioSample accession number", "Key publications", "Genome Label", "Medium type", "Growth medium", "Growth temperature", "Aeration", "Growth time", "Growth phase or OD", "Other growth conditions", "Metagenome details", "Metagenomic sample description", "Sample Growth Conditions Label", "Extraction solvent", "Other extraction details", "Extraction Method Label", "Instrumentation", "Column details", "Instrument mode", "Mass range", "Collision energy", "Buffering", "Other instrumentation information", "Instrumentation Method Label"]
            ];
            expect(table).toEqual(expected);
        });

        it('should convert kitchen sick', () => {
            const table = textTable(schema, kitchenSinkDoc);
            const expected = [
                ["Location of metabolomics data file", "Genome or Metagenome", "GenBank accession number", "RefSeq accession number", "ENA/NCBI accession number", "MGnify accession number", "BioSample accession number", "Key publications", "Genome Label", "Medium type", "Growth medium", "Growth temperature", "Aeration", "Growth time", "Growth phase or OD", "Other growth conditions", "Metagenome details", "Metagenomic sample description", "Sample Growth Conditions Label", "Extraction solvent", "Other extraction details", "Extraction Method Label", "Instrumentation", "Column details", "Instrument mode", "Mass range", "Collision energy", "Buffering", "Other instrumentation information", "Instrumentation Method Label"],
                ["ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML", "genome", "AL645882", "NC_003888.3", undefined, undefined, "SAMEA3648350", "12000953", "Streptomyces coelicolor A3(2)", "liquid", "Nutrient Agar", 37, "shaking", 24, "odbla", "otrhergrotcondf", "Other mammal", "metagen samp desc", "agar", "Methanol=1", undefined, "meth", "Quadrupole", "Reverse Phase", "Positive", "1000-10000", "1234-56789", "0.1% formic acid", "Atomaton 400h+", "quad"],
                ["ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2", "genome", "AL645882", "NC_003888.3", undefined, undefined, "SAMEA3648350", "12000953", "Streptomyces coelicolor A3(2)", "liquid", "blood", 1, "not shaking", undefined, undefined, undefined, "Human", "met sam desc", "blod", "beer=0.9;Water=0.1", "no alc", "beer", "blackhole", "Reverse Phase", "Positive", undefined, undefined, undefined, undefined, "bh"]
            ];
            expect(table).toEqual(expected);
        });
    });

    describe('jsonDocument', () => {
        it('should convert minimal text table to json doc', () => {
            const table: any[] = [];
            const doc = jsonDocument(schema, table);
            const expected = {
                "version": "1",
                "personal": {},
                "metabolomics": {},
                "genomes": [],
                "experimental": {
                    sample_preparation: [],
                    extraction_methods: [],
                    instrumentation_methods: []
                },
                "genome_metabolome_links": []
            };
            expect(doc).toEqual(expected);
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
                "Location of metabolomics data file",
                "Genome or Metagenome", "GenBank accession number", "RefSeq accession number", "ENA/NCBI accession number", "MGnify accession number", "BioSample accession number", "Key publications", "Genome Label",
                "Medium type", "Growth medium", "Growth temperature", "Aeration", "Growth time", "Growth phase or OD", "Other growth conditions", "Metagenome details", "Metagenomic sample description", "Sample Growth Conditions Label",
                "Extraction solvent", "Other extraction details", "Extraction Method Label",
                "Instrumentation", "Column details", "Instrument mode", "Mass range", "Collision energy", "Buffering", "Other instrumentation information", "Instrumentation Method Label"
            ];
            const rows = [
                ["ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2", "genome", "AL645882", "NC_003888.3", undefined, undefined, "SAMEA3648350", "12000953", "Streptomyces coelicolor A3(2)", "liquid", "blood", 1, "not shaking", undefined, undefined, undefined, "Human", "met sam desc", "blod", "beer=0.9;Water=0.1", "no alc", "beer", "blackhole", "Reverse Phase", "Positive", undefined, undefined, undefined, undefined, "bh"]
            ];
            const table = arrayParse(header, rows);
            const doc = jsonDocument(schema, table);
            const expected = {
                "experimental": {
                    "extraction_methods": [{
                        "extraction_method": "beer",
                        "other_extraction_parameters": "no alc",
                        "solvents": [{
                            "Other_solvent": "beer", "ratio": 0.9
                        }, {
                            "ratio": 0.1,
                            "solvent": "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:15377"
                        }]
                    }],
                    "instrumentation_methods": [{
                        "column": "Reverse Phase",
                        "instrumentation": { "other_instrument": "blackhole" },
                        "instrumentation_method": "bh",
                        "mode": "https://bioportal.bioontology.org/ontologies/MS/?p=classes&conceptid=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FMS_1000130"
                    }],
                    "sample_preparation": [{
                        "aeration": "not shaking",
                        "growth_temperature": 1,
                        "medium_details": {
                            "Other_medium": "blood",
                            "medium_type": "liquid"
                        },
                        "metagenome_details": {
                            "environment": "https://bioportal.bioontology.org/ontologies/MEO/?p=classes&conceptid=http%3A%2F%2Fpurl.jp%2Fbio%2F11%2Fmeo%2FMEO_0000393"
                        },
                        "metagenomic_sample_description": "met sam desc",
                        "sample_preparation_method": "blod"
                    }]
                },
                "genome_metabolome_links": [{
                    "extraction_method_label": "beer",
                    "genome_label": "Streptomyces coelicolor A3(2)",
                    "instrumentation_method_label": "bh",
                    "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2",
                    "sample_preparation_label": "blod"
                }],
                "genomes": [{
                    "BioSample_accession": "SAMEA3648350",
                    "genome_ID": {
                        "GenBank_accession": "AL645882",
                        "RefSeq_accession": "NC_003888.3",
                        "genome_type": "genome"
                    },
                    "publications": "12000953",
                    "genome_label": "Streptomyces coelicolor A3(2)"
                }],
                "metabolomics": {},
                "personal": {},
                "version": "1"
            };
            expect(doc).toEqual(expected);
        });

        it('should convert a single link all fields text table to json doc', () => {
            const header = [
                "Location of metabolomics data file",
                "Genome or Metagenome", "GenBank accession number", "RefSeq accession number", "ENA/NCBI accession number", "MGnify accession number", "BioSample accession number", "Key publications", "Genome Label",
                "Medium type", "Growth medium", "Growth temperature", "Aeration", "Growth time", "Growth phase or OD", "Other growth conditions", "Metagenome details", "Metagenomic sample description", "Sample Growth Conditions Label",
                "Extraction solvent", "Other extraction details", "Extraction Method Label",
                "Instrumentation", "Column details", "Instrument mode", "Mass range", "Collision energy", "Buffering", "Other instrumentation information", "Instrumentation Method Label"
            ];
            const rows = [
                ["ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML",
                    "genome", "AL645882", "NC_003888.3", undefined, undefined, "SAMEA3648350", "12000953", "Streptomyces coelicolor A3(2)",
                    "liquid", "Nutrient Agar", 37, "shaking", 24, "odbla", "otrhergrotcondf", "Other mammal", "metagen samp desc", "agar",
                    "Methanol=1", undefined, "meth",
                    "Quadrupole", "Reverse Phase", "Positive", "1000-10000", "1234-56789", "0.1% formic acid", "Atomaton 400h+", "quad"],
            ];
            const table = arrayParse(header, rows);
            const doc = jsonDocument(schema, table);
            const expected = {
                "version": "1",
                "personal": {},
                "metabolomics": {},
                "genomes": [
                    {
                        "genome_ID": {
                            "genome_type": "genome",
                            "GenBank_accession": "AL645882",
                            "RefSeq_accession": "NC_003888.3"
                        },
                        "BioSample_accession": "SAMEA3648350",
                        "publications": "12000953",
                        "genome_label": "Streptomyces coelicolor A3(2)"
                    }
                ],
                "experimental": {
                    "sample_preparation": [
                        {
                            "medium_details": {
                                "medium_type": "liquid",
                                "medium": "http://www.dsmz.de/microorganisms/medium/pdf/DSMZ_Medium1.pdf"
                            },
                            "growth_temperature": 37,
                            "aeration": "shaking",
                            "growing_time": 24,
                            "metagenome_details": {
                                "environment": "https://bioportal.bioontology.org/ontologies/MEO/?p=classes&conceptid=http%3A%2F%2Fpurl.jp%2Fbio%2F11%2Fmeo%2FMEO_0000395"
                            },
                            "sample_preparation_method": "agar",
                            "growth_phase_OD": "odbla",
                            "other_growth_conditions": "otrhergrotcondf",
                            "metagenomic_sample_description": "metagen samp desc"
                        }
                    ],
                    "extraction_methods": [
                        {
                            "solvents": [
                                {
                                    "solvent": "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:17790",
                                    "ratio": 1
                                }
                            ],
                            "extraction_method": "meth"
                        }
                    ],
                    "instrumentation_methods": [
                        {
                            "instrumentation": {
                                "instrument": "https://bioportal.bioontology.org/ontologies/MS/?p=classes&conceptid=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FMS_1000081"
                            },
                            "column": "Reverse Phase",
                            "mode": "https://bioportal.bioontology.org/ontologies/MS/?p=classes&conceptid=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FMS_1000130",
                            "instrumentation_method": "quad",
                            "range": "1000-10000",
                            "collision_energy": "1234-56789",
                            "buffering": "0.1% formic acid",
                            "other_instrumentation": "Atomaton 400h+"
                        }
                    ]
                },

                "genome_metabolome_links": [{
                    "genome_label": "Streptomyces coelicolor A3(2)",
                    "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML",
                    "sample_preparation_label": "agar",
                    "extraction_method_label": "meth",
                    "instrumentation_method_label": "quad"
                }]
            };
            expect(doc).toEqual(expected);
        })
    });

    describe('tsvUrl', () => {
        it('should render doc with no links as just header', () => {
            const doc = {
                "version": "1",
                "personal": {},
                "metabolomics": {
                    "GNPSMassIVE_ID": "MSV000078839",
                    "MaSSIVE_URL": "https://gnps.ucsd.edu/ProteoSAFe/result.jsp?task=a507232a787243a5afd69a6c6fa1e508&view=advanced_view"
                },
                "genomes": [],
                "experimental": {},
                "genome_metabolome_links": []
            };
            const url = tsvUrl(schema, doc);
            const expected = 'data:text/tab-separated-values;base64,TG9jYXRpb24gb2YgbWV0YWJvbG9taWNzIGRhdGEgZmlsZQlHZW5vbWUgb3IgTWV0YWdlbm9tZQlHZW5CYW5rIGFjY2Vzc2lvbiBudW1iZXIJUmVmU2VxIGFjY2Vzc2lvbiBudW1iZXIJRU5BL05DQkkgYWNjZXNzaW9uIG51bWJlcglNR25pZnkgYWNjZXNzaW9uIG51bWJlcglCaW9TYW1wbGUgYWNjZXNzaW9uIG51bWJlcglLZXkgcHVibGljYXRpb25zCUdlbm9tZSBMYWJlbAlNZWRpdW0gdHlwZQlHcm93dGggbWVkaXVtCUdyb3d0aCB0ZW1wZXJhdHVyZQlBZXJhdGlvbglHcm93dGggdGltZQlHcm93dGggcGhhc2Ugb3IgT0QJT3RoZXIgZ3Jvd3RoIGNvbmRpdGlvbnMJTWV0YWdlbm9tZSBkZXRhaWxzCU1ldGFnZW5vbWljIHNhbXBsZSBkZXNjcmlwdGlvbglTYW1wbGUgR3Jvd3RoIENvbmRpdGlvbnMgTGFiZWwJRXh0cmFjdGlvbiBzb2x2ZW50CU90aGVyIGV4dHJhY3Rpb24gZGV0YWlscwlFeHRyYWN0aW9uIE1ldGhvZCBMYWJlbAlJbnN0cnVtZW50YXRpb24JQ29sdW1uIGRldGFpbHMJSW5zdHJ1bWVudCBtb2RlCU1hc3MgcmFuZ2UJQ29sbGlzaW9uIGVuZXJneQlCdWZmZXJpbmcJT3RoZXIgaW5zdHJ1bWVudGF0aW9uIGluZm9ybWF0aW9uCUluc3RydW1lbnRhdGlvbiBNZXRob2QgTGFiZWw=';
            expect(url).toEqual(expected);
        });
    })
});
