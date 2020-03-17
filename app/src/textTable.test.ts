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
                ['Genome/Metagenome', 'Location of metabolomics data file', 'Sample Growth Conditions', 'Extraction Method', 'Instrumentation Method']
            ];
            expect(table).toEqual(expected);
        });

        it('should convert kitchen sick', () => {
            const table = textTable(schema, kitchenSinkDoc);
            const expected = [
                [
                    'Genome/Metagenome', 'Location of metabolomics data file', 'Sample Growth Conditions', 'Extraction Method', 'Instrumentation Method'
                ],
                [
                    'Streptomyces sp. CNB091', 'ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML',
                    'agar', 'meth', 'quad'
                ],
                [
                    'Streptomyces sp. CNB091',
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
                'Genome/Metagenome', 'Location of metabolomics data file', 'Sample Growth Conditions', 'Extraction Method', 'Instrumentation Method'
            ];
            const rows = [
                ["Streptomyces sp. CNB091", "ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2", "agar", "beer", "bh"]
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
    });

    describe('tsvUrl', () => {
        it('should render doc with no links as just header', () => {
            const doc = {
                "version": "1",
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
            const expected = 'data:text/tab-separated-values;base64,R2Vub21lL01ldGFnZW5vbWUJTG9jYXRpb24gb2YgbWV0YWJvbG9taWNzIGRhdGEgZmlsZQlTYW1wbGUgR3Jvd3RoIENvbmRpdGlvbnMJRXh0cmFjdGlvbiBNZXRob2QJSW5zdHJ1bWVudGF0aW9uIE1ldGhvZA==';
            expect(url).toEqual(expected);
        });
    })
});
