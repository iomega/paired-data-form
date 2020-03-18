import { IOMEGAPairedOmicsDataPlatform } from './schema';
import { migrations, Migration, migrate } from './migrate';

const EXAMPLE_PROJECT_JSON_V1 = {
    'version': '1',
    'personal': {
        'submitter_name': 'Justin van der Hooft',
        'submitter_orcid': 'https://orcid.org/0000-0002-9340-5511',
        'submitter_email': 'justin.vanderhooft@wur.nl',
        'PI_name': 'Marnix Medema',
        'PI_institution': 'Wageningen University & Research',
        'PI_email': 'marnix.medema@wur.nl'
    },
    'metabolomics': {
        'project': {
            'GNPSMassIVE_ID': 'MSV000078839',
            'MaSSIVE_URL': 'https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=a507232a787243a5afd69a6c6fa1e508',
            'molecular_network': 'c36f90ba29fe44c18e96db802de0c6b9'
        },
        'related_GNPSMassIVE_ID': 'MSV000078836',
        'publications': '28335604'
    },
    'genomes': [
        {
            'genome_ID': {
                'genome_type': 'genome',
                'GenBank_accession': 'AZXI01000001'
            },
            'BioSample_accession': 'SAMN02597265',
            'publications': '28335604',
            'genome_label': 'Salinispora arenicola CNB527'
        }
    ],
    'experimental': {
        'sample_preparation': [
            {
                'medium_details': {
                    'medium_type': 'solid',
                    'medium': 'https://www.elabprotocols.com/protocols/#!protocol=486'
                },
                'growth_parameters': {
                    'growth_duration': 168,
                    'growth_temperature': 30
                },
                'aeration': {
                    'aeration_type': 'not shaking'
                },
                'sample_preparation_method': 'R5'
            }
        ],
        'extraction_methods': [
            {
                'solvents': [
                    {
                        'solvent': 'http://purl.obolibrary.org/obo/CHEBI_27750',
                        'ratio': 1
                    }
                ],
                'extracted_material': 'cells',
                'extraction_method': 'EthylAcetate'
            }
        ],
        'instrumentation_methods': [
            {
                'instrumentation': {
                    'instrument': 'http://purl.obolibrary.org/obo/MS_1000084'
                },
                'column': 'Reverse Phase',
                'mode': 'http://purl.obolibrary.org/obo/MS_1000130',
                'ionization': {
                    'ionization_type': 'http://purl.obolibrary.org/obo/MS_1000073'
                },
                'range': '300 - 1700',
                'collision_energy': '20 keV',
                'buffering': '0.1% TFA',
                'instrumentation_method': 'ToF'
            }
        ]
    },
    'genome_metabolome_links': [
        {
            'genome_label': 'Salinispora arenicola CNB527',
            'metabolomics_file': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB527_R5_E.mzXML',
            'sample_preparation_label': 'R5',
            'extraction_method_label': 'EthylAcetate',
            'instrumentation_method_label': 'ToF'
        }
    ],
    'BGC_MS2_links': [
        {
            'known_link': 'A Molecular Family of Staurosporine and Hydroxystaurosporine and related molecules that can be linked to a reference gene cluster in MiBIG from Salinispora CNS205 that is included in this study in which it was earlier validated.',
            'verification': [
                'Evidence as indicated in MIBiG'
            ],
            'SMILES': 'C[C@@]12[C@@H]([C@@H](C[C@@H](O1)N3C4=CC=CC=C4C5=C6C(=C7C8=CC=CC=C8N2C7=C53)CNC6=O)NC)OC',
            'IUPAC': '(2S,3R,4R,6R)-3-methoxy-2-methyl-4-(methylamino)-29-oxa-1,7,17-triazaoctacyclo[12.12.2.12,6.07,28.08,13.015,19.020,27.021,26]nonacosa-8,10,12,14,19,21,23,25,27-nonaen-16-one',
            'BGC_ID': {
                'BGC': 'MIBiG number associated with this exact BGC',
                'MIBiG_number': 827
            },
            'link': 'GNPS molecular family',
            'network_nodes_URL': 'https://gnps.ucsd.edu/ProteoSAFe/result.jsp?view=network_displayer&componentindex=201&task=c36f90ba29fe44c18e96db802de0c6b9#%7B%7D'
        },
        {
            'known_link': 'Arenimycin A as produced by Salinispora strain CNB527 which is present under the strains studied. It was only extracted by EthylAcetate.',
            'verification': [
                'Evidence as indicated in MIBiG'
            ],
            'SMILES': 'CCCOC(=O)c1c(C)cc2c(c1O)[C@@]1(O)C(=O)c3cc4c(c(O)c3C(=O)[C@@]1(OC)CC2)C(=O)C=C(N[C@H]1O[C@@H](C)[C@H](O)[C@H](O)[C@H]1OC)C4=O',
            'IUPAC': 'methyl (6aR,14aS)-11-[[(2S,3R,4R,5R,6S)-4,5-dihydroxy-3-methoxy-6-methyloxan-2-yl]amino]-1,8,14a-trihydroxy-6a-methoxy-3-methyl-7,9,12,14-tetraoxo-5,6-dihydrobenzo[a]tetracene-2-carboxylate',
            'BGC_ID': {
                'BGC': 'MIBiG number of a similar BGC from a closely related strain',
                'similar_MIBiG_number': 198
            },
            'link': 'single molecule',
            'MS2_URL': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB527_R5_E.mzXML',
            'MS2_scan': '977106'
        }
    ]
};

const EXAMPLE_PROJECT_JSON_V2 = {
    'version': '2',
    'personal': {
        'submitter_name': 'Justin van der Hooft',
        'submitter_orcid': 'https://orcid.org/0000-0002-9340-5511',
        'submitter_email': 'justin.vanderhooft@wur.nl',
        'PI_name': 'Marnix Medema',
        'PI_institution': 'Wageningen University & Research',
        'PI_email': 'marnix.medema@wur.nl'
    },
    'metabolomics': {
        'project': {
            'GNPSMassIVE_ID': 'MSV000078839',
            'MaSSIVE_URL': 'https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=a507232a787243a5afd69a6c6fa1e508',
            'molecular_network': 'c36f90ba29fe44c18e96db802de0c6b9'
        },
        'related_GNPSMassIVE_ID': 'MSV000078836',
        'publications': '28335604'
    },
    'genomes': [
        {
            'genome_ID': {
                'genome_type': 'genome',
                'GenBank_accession': 'AZXI01000001'
            },
            'BioSample_accession': 'SAMN02597265',
            'publications': '28335604',
            'genome_label': 'Salinispora arenicola CNB527'
        }
    ],
    'experimental': {
        'sample_preparation': [
            {
                'medium_details': {
                    'medium_type': 'solid',
                    'medium': 'https://www.elabprotocols.com/protocols/#!protocol=486'
                },
                'growth_parameters': {
                    'growth_duration': 168,
                    'growth_temperature': 30
                },
                'aeration': {
                    'aeration_type': 'not shaking'
                },
                'sample_preparation_method': 'R5'
            }
        ],
        'extraction_methods': [
            {
                'solvents': [
                    {
                        'solvent': 'http://purl.obolibrary.org/obo/CHEBI_27750',
                        'ratio': 1
                    }
                ],
                'extracted_material': 'cells',
                'extraction_method': 'EthylAcetate'
            }
        ],
        'instrumentation_methods': [
            {
                'instrumentation': {
                    'instrument': 'http://purl.obolibrary.org/obo/MS_1000084'
                },
                'column': 'Reverse Phase',
                'mode': 'http://purl.obolibrary.org/obo/MS_1000130',
                'ionization': {
                    'ionization_type': 'http://purl.obolibrary.org/obo/MS_1000073'
                },
                'range': '300 - 1700',
                'collision_energy': '20 keV',
                'buffering': '0.1% TFA',
                'instrumentation_method': 'ToF'
            }
        ]
    },
    'genome_metabolome_links': [
        {
            'genome_label': 'Salinispora arenicola CNB527',
            'metabolomics_file': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB527_R5_E.mzXML',
            'sample_preparation_label': 'R5',
            'extraction_method_label': 'EthylAcetate',
            'instrumentation_method_label': 'ToF'
        }
    ],
    'BGC_MS2_links': [
        {
            'known_link': 'A Molecular Family of Staurosporine and Hydroxystaurosporine and related molecules that can be linked to a reference gene cluster in MiBIG from Salinispora CNS205 that is included in this study in which it was earlier validated.',
            'verification': [
                'Evidence as indicated in MIBiG'
            ],
            'SMILES': 'C[C@@]12[C@@H]([C@@H](C[C@@H](O1)N3C4=CC=CC=C4C5=C6C(=C7C8=CC=CC=C8N2C7=C53)CNC6=O)NC)OC',
            'IUPAC': '(2S,3R,4R,6R)-3-methoxy-2-methyl-4-(methylamino)-29-oxa-1,7,17-triazaoctacyclo[12.12.2.12,6.07,28.08,13.015,19.020,27.021,26]nonacosa-8,10,12,14,19,21,23,25,27-nonaen-16-one',
            'BGC_ID': {
                'BGC': 'MIBiG number associated with this exact BGC',
                'MIBiG_number': 'BGC0000827'
            },
            'link': 'GNPS molecular family',
            'network_nodes_URL': 'https://gnps.ucsd.edu/ProteoSAFe/result.jsp?view=network_displayer&componentindex=201&task=c36f90ba29fe44c18e96db802de0c6b9#%7B%7D'
        },
        {
            'known_link': 'Arenimycin A as produced by Salinispora strain CNB527 which is present under the strains studied. It was only extracted by EthylAcetate.',
            'verification': [
                'Evidence as indicated in MIBiG'
            ],
            'SMILES': 'CCCOC(=O)c1c(C)cc2c(c1O)[C@@]1(O)C(=O)c3cc4c(c(O)c3C(=O)[C@@]1(OC)CC2)C(=O)C=C(N[C@H]1O[C@@H](C)[C@H](O)[C@H](O)[C@H]1OC)C4=O',
            'IUPAC': 'methyl (6aR,14aS)-11-[[(2S,3R,4R,5R,6S)-4,5-dihydroxy-3-methoxy-6-methyloxan-2-yl]amino]-1,8,14a-trihydroxy-6a-methoxy-3-methyl-7,9,12,14-tetraoxo-5,6-dihydrobenzo[a]tetracene-2-carboxylate',
            'BGC_ID': {
                'BGC': 'MIBiG number of a similar BGC from a closely related strain',
                'similar_MIBiG_number': 'BGC0000198'
            },
            'link': 'single molecule',
            'MS2_URL': 'ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB527_R5_E.mzXML',
            'MS2_scan': '977106'
        }
    ]
};

describe('migrateProject1to2 migration ', () => {
    let migration: Migration;

    beforeAll(() => {
        migration = migrations[0];
    });

    describe('up()', () => {
        describe('with version 1 project', () => {
            let result: IOMEGAPairedOmicsDataPlatform;

            beforeAll(() => {
                // migration happens in place, to compare later need a untouched example
                const copy = JSON.parse(JSON.stringify(EXAMPLE_PROJECT_JSON_V1));
                result = migration.up(copy);
            });

            it('should have version to 2', () => {
                expect(result.version).toEqual('2');
            });

            it('should have MIBiG accession instead of number', () => {
                expect(result.BGC_MS2_links![0].BGC_ID.MIBiG_number).toEqual('BGC0000827');
                expect(result.BGC_MS2_links![1].BGC_ID.similar_MIBiG_number).toEqual('BGC0000198');
            });

        });
    });

    describe('applicable()', () => {
        describe('with version 1 project', () => {
            it('should migrate', () => {
                const result = migration.applicable(EXAMPLE_PROJECT_JSON_V1);
                expect(result).toBeTruthy();
            });
        });

        describe('with version 2 project', () => {
            it('should not migrate', () => {
                const result = migration.applicable(EXAMPLE_PROJECT_JSON_V2);
                expect(result).toBeFalsy();
            });
        });

    });

});

describe('migrate()', () => {
    let store: any;

    describe('with 2 approved and 2 pending project of version 1 and 2', () => {
        beforeAll(() => {
            store = {
                listPendingProjects() {
                    return [{
                        _id: 'somependingprojectid1',
                        project: JSON.parse(JSON.stringify(EXAMPLE_PROJECT_JSON_V1))
                    }, {
                        _id: 'somependingprojectid2',
                        project: JSON.parse(JSON.stringify(EXAMPLE_PROJECT_JSON_V2))
                    }];
                },
                listProjects() {
                    return [{
                        _id: 'someapprovedprojectid1',
                        project: JSON.parse(JSON.stringify(EXAMPLE_PROJECT_JSON_V1))
                    }, {
                        _id: 'someapprovedprojectid2',
                        project: JSON.parse(JSON.stringify(EXAMPLE_PROJECT_JSON_V2))
                    }];
                },
                disk_store: {
                    writePendingProject: jest.fn(),
                    approveProject: jest.fn()
                }
            };
            migrate(store);
        });

        it('should written migrated pending project', () => {
            expect(store.disk_store.writePendingProject).toHaveBeenCalledWith('somependingprojectid1', EXAMPLE_PROJECT_JSON_V2);
        });

        it('should written migrated prevously approved as pending project', () => {
            expect(store.disk_store.writePendingProject).toHaveBeenCalledWith('someapprovedprojectid1', EXAMPLE_PROJECT_JSON_V2);
        });

        it('should have approved the prevously approved project', () => {
            expect(store.disk_store.approveProject).toHaveBeenCalledWith('someapprovedprojectid1');
        });

        it('should not have written projects that where already of version 2', () => {
            expect(store.disk_store.writePendingProject).toHaveBeenCalledTimes(2);
            expect(store.disk_store.approveProject).toHaveBeenCalledTimes(1);
        });
    });
});