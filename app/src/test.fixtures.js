/* tslint:disable:object-literal-sort-keys */

export const minimalDoc = {
    "version": "3",
    "personal": {},
    "metabolomics": {
        "project": {
            "GNPSMassIVE_ID": "MSV000078839",
            "MaSSIVE_URL": "https://gnps.ucsd.edu/ProteoSAFe/result.jsp?task=a507232a787243a5afd69a6c6fa1e508&view=advanced_view"
        }
    },
    "genomes": [],
    "proteomes": [],
    "experimental": {},
    "genome_metabolome_links": []
};

export const kitchenSinkDoc = {
    "version": "3",
    "personal": {
        "submitter_name": "Justin van der Hooft",
        "submitter_orcid": "https://orcid.org/0000-0002-9340-5511",
        "submitter_email": "justin.vanderhooft@wur.nl",
        "PI_name": "Marnix Medema",
        "PI_institution": "Wageningen University & Research",
        "PI_email": "marnix.medema@wur.nl"
    },
    "metabolomics": {
        "project": {
            "GNPSMassIVE_ID": "MSV000078839",
            "MaSSIVE_URL": "https://massive.ucsd.edu/ProteoSAFe/dataset.jsp?task=a507232a787243a5afd69a6c6fa1e508",
            "molecular_network": "https://gnps.ucsd.edu/ProteoSAFe/status.jsp?task=c36f90ba29fe44c18e96db802de0c6b9"
        },
        "publications": "28335604"
    },
    "genomes": [
        {
            "genome_ID": {
                "genome_type": "genome",
                "GenBank_accession": "ARJI01000000"
            },
            "publications": "28335604",
            "genome_label": "Streptomyces sp. CNB091"
        },
        {
            "genome_ID": {
                "genome_type": "genome",
                "GenBank_accession": "AZWL01000000"
            },
            "publications": "28335604",
            "genome_label": "Streptomyces sp. CNH099"
        },
        {
            "genome_ID": {
                "genome_type": "genome",
                "GenBank_accession": "AZXI01000001"
            },
            "publications": "28335604",
            "genome_label": "Salinispora arenicola CNB527"
        }
    ],
    "experimental": {
        "sample_preparation": [
            {
                "medium_details": {
                    "medium_type": "liquid",
                    "medium": "http://www.dsmz.de/microorganisms/medium/pdf/DSMZ_Medium1.pdf",
                },
                "growth_parameters": {
                    "growth_temperature": 37,
                    "growth_duration": 24,
                    "growth_phase_OD": "odbla",
                },
                "aeration": {
                    "aeration_type": "shaking"
                },
                "sample_preparation_method": "agar",
                "other_growth_conditions": "otrhergrotcondf",
                "metagenomic_sample_description": "metagen samp desc"
            },
            {
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
            }
        ],
        "extraction_methods": [
            {
                "solvents": [
                    {
                        "solvent": "http://purl.obolibrary.org/obo/CHEBI_17790",
                        "ratio": 1
                    }
                ],
                "extraction_method": "meth"
            },
            {
                "solvents": [
                    {
                        "solvent": "http://purl.obolibrary.org/obo/CHEBI_46787",
                        "ratio": 0.9,
                        "Other_solvent": "beer"
                    },
                    {
                        "solvent": "http://purl.obolibrary.org/obo/CHEBI_15377",
                        "ratio": 0.1
                    }
                ],
                "other_extraction_parameters": "no alc",
                "extraction_method": "beer"
            }
        ],
        "instrumentation_methods": [
            {
                "instrumentation": {
                    "instrument": "http://purl.obolibrary.org/obo/MS_1000081"
                },
                "column": "Reverse Phase",
                "mode": "http://purl.obolibrary.org/obo/MS_1000130",
                "instrumentation_method": "quad",
                "range": "1000-10000",
                "collision_energy": "1234-56789",
                "buffering": "0.1% formic acid",
                "other_instrumentation": "Atomaton 400h+"
            },
            {
                "instrumentation": {
                    "instrument": "http://purl.obolibrary.org/obo/MS_1000443",
                    "other_instrument": "blackhole"
                },
                "column": "Reverse Phase",
                "mode": "http://purl.obolibrary.org/obo/MS_1000130",
                "instrumentation_method": "bh"
            }
        ]
    },
    "proteomes": [{
      "proteome_ID": {
        "proteome_type": "Full proteome"
      },
      "raw_data": {
        "database": {
          "database_name": "ProteomeXchange"
        },
        "proteome_data_link": "http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD014413"
      },
      "method": {
        "peptide_labelling": "None",
        "analysis_mode": "Data-dependent acquisition (DDA)",
        "genome_label": "Salinispora arenicola CNB527"
      },
      "experimental_details": {
        "sample_preparation_label": "blod",
        "instrumentation_method_label": "quad"
      },
      "more_info": {
        "notes": "Mock\nwith Mannitol"
      },
      "proteome_label": "Proteomics_Man"
    }, {
      "proteome_ID": {
        "proteome_type": "Full proteome"
      },
      "raw_data": {
        "database": {
          "database_name": "ProteomeXchange"
        },
        "proteome_data_link": "http://proteomecentral.proteomexchange.org/cgi/GetDataset?ID=PXD014413"
      },
      "method": {
        "peptide_labelling": "None",
        "analysis_mode": "Data-dependent acquisition (DDA)",
        "genome_label": "Salinispora arenicola CNB527"
      },
      "experimental_details": {
        "sample_preparation_label": "agar",
        "instrumentation_method_label": "quad"
      },
      "more_info": {
        "notes": "Mock\nwith Mannitol"
      },
      "proteome_label": "Proteomics_Gly"
  }],
  "genome_metabolome_links": [
        {
            "genome_label": "Streptomyces sp. CNB091",
            "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML",
            "sample_preparation_label": "agar",
            "extraction_method_label": "meth",
            "instrumentation_method_label": "quad",
            "proteome_label": "Proteomics_Man"
        },
        {
            "genome_label": "Streptomyces sp. CNB091",
            "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2",
            "sample_preparation_label": "blod",
            "extraction_method_label": "beer",
            "instrumentation_method_label": "bh"
        }
    ]
};

export const kitchenSinkEnrichedDoc = {
    _id: 'kitchen-sink-id',
    project: kitchenSinkDoc,
    enrichments: {
        "genomes": {
            "Streptomyces sp. CNB091": {
                "url": "https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000",
                "title": "Streptomyces sp. CNB091, whole genome shotgun sequencing project",
                "species": { "tax_id": 1169156, "scientific_name": "Streptomyces sp. CNB091" }
            }, "Streptomyces sp. CNH099": {
                "url": "https://www.ncbi.nlm.nih.gov/nuccore/AZWL01000000",
                "title": "Streptomyces sp. CNH099, whole genome shotgun sequencing project",
                "species": { "tax_id": 1137269, "scientific_name": "Streptomyces sp. CNH099" }
            }, "Salinispora arenicola CNB527": {
                "url": "https://www.ncbi.nlm.nih.gov/nuccore/AZXI01000001",
                "title": "Salinispora arenicola CNB527 B033DRAFT_scaffold_0.1_C, whole genome shotgun sequence",
                "species": { "tax_id": 1137250, "scientific_name": "Salinispora arenicola CNB527" }
            }
        }
    }
}

export const minimalGrowthMediumDoc = {
    _id: 'minimal-growth-medium-id',
    project: {
        "version": "3",
        "personal": {},
        "metabolomics": {
            "project": {
                "GNPSMassIVE_ID": "MSV000078839",
                "MaSSIVE_URL": "https://gnps.ucsd.edu/ProteoSAFe/result.jsp?task=a507232a787243a5afd69a6c6fa1e508&view=advanced_view"
            }
        },
        "genomes": [{
            "genome_ID": {
                "genome_type": "genome",
                "GenBank_accession": "ARJI01000000"
            },
            "publications": "28335604",
            "genome_label": "Streptomyces sp. CNB091"
        }],
        "proteomes": [],
        "experimental": {
            "sample_preparation": [
                {
                    "medium_details": {
                        "medium_type": "liquid"
                    },
                    "growth_parameters": {},
                    "aeration": {},
                    "sample_preparation_method": "agar"
                }
            ],
            "extraction_methods": [
                {
                    "solvents": [
                        {
                            "solvent": "http://purl.obolibrary.org/obo/CHEBI_17790",
                            "ratio": 1
                        }
                    ],
                    "extraction_method": "meth"
                }
            ],
            "instrumentation_methods": [
                {
                    "instrumentation": {
                        "instrument": "http://purl.obolibrary.org/obo/MS_1000443",
                        "other_instrument": "blackhole"
                    },
                    "column": "Reverse Phase",
                    "mode": "http://purl.obolibrary.org/obo/MS_1000130",
                    "instrumentation_method": "bh"
                }
            ]
        },
        "genome_metabolome_links": [{
            "genome_label": "Streptomyces sp. CNB091",
            "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML",
            "sample_preparation_label": "agar",
            "extraction_method_label": "meth",
            "instrumentation_method_label": "bh"
        }]
    }
};

export const bgcms2linkDoc = {
    ...minimalGrowthMediumDoc.project,
    "BGC_MS2_links": [{
        "known_link": "A Molecular Family of Rosamicin and its byproducts Salinipyrone A, Pacificanone A, found in a number of Salinispora strains under which CNS-237 that also produces the byproducts.",
        "verification": [
            "Evidence as indicated in MIBiG"
        ],
        "omics_based_evidence": {
            "omics_based_evidence_type": "Not available"
        },
        "SMILES": "CC[C@@H]1[C@H]([C@H]2[C@@](O2)(/C=C/C(=O)[C@@H](C[C@@H]([C@@H]([C@H]([C@@H](CC(=O)O1)O)C)O[C@H]3[C@@H]([C@H](C[C@H](O3)C)N(C)C)O)CC=O)C)C)C",
        "IUPAC": "2-[(1S,2R,3R,7R,8S,9S,10R,12R,14E,16S)-9-[(2S,3R,4S,6R)-4-(dimethylamino)-3-hydroxy-6-methyloxan-2-yl]oxy-3-ethyl-7-hydroxy-2,8,12,16-tetramethyl-5,13-dioxo-4,17-dioxabicyclo[14.1.0]heptadec-14-en-10-yl]acetaldehyde",
        "BGC_ID": {
            "BGC": "MIBiG number associated with this exact BGC",
            "MIBiG_number": "BGC0001830"
        },
        "link": "GNPS molecular family",
        "network_nodes_URL": "https://gnps.ucsd.edu/ProteoSAFe/result.jsp?view=network_displayer&componentindex=290&task=c36f90ba29fe44c18e96db802de0c6b9#%7B%7D"
    },
    {
        "known_link": "Arenimycin A as produced by Salinispora strain CNB527 which is present under the strains studied. It was only extracted by EthylAcetate.",
        "verification": [
            "Evidence as indicated in MIBiG"
        ],
        "omics_based_evidence": {
          "omics_based_evidence_type": "Not available"
      },
      "SMILES": "CCCOC(=O)c1c(C)cc2c(c1O)[C@@]1(O)C(=O)c3cc4c(c(O)c3C(=O)[C@@]1(OC)CC2)C(=O)C=C(N[C@H]1O[C@@H](C)[C@H](O)[C@H](O)[C@H]1OC)C4=O",
        "IUPAC": "methyl (6aR,14aS)-11-[[(2S,3R,4R,5R,6S)-4,5-dihydroxy-3-methoxy-6-methyloxan-2-yl]amino]-1,8,14a-trihydroxy-6a-methoxy-3-methyl-7,9,12,14-tetraoxo-5,6-dihydrobenzo[a]tetracene-2-carboxylate",
        "BGC_ID": {
            "BGC": "MIBiG number associated with this exact BGC",
            "MIBiG_number": "BGC0000198"
        },
        "link": "single molecule",
        "MS2_URL": "ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML",
        "MS2_scan": "977106"
    }]
};

export const bgcmsprot2linkDoc = {
  ...kitchenSinkDoc,
    "BGC_MS2_links": [{
        "known_link": "Arenimycin A as produced by Salinispora strain CNB527 which is present under the strains studied. It was only extracted by EthylAcetate.",
        "verification": [
            "Evidence as indicated in MIBiG"
        ],
        "omics_based_evidence": {
            "omics_based_evidence_type": "Quantitative proteomics experiment",
            "quantitative_proteomics_experiment": {
              "evidences": "Carbon source difference:\nControl - Mannitol\nExperiment - Glycerol",
              "comparison_groups": [
                {
                  "protein_id": {
                    "protein_database": "uniprot",
                    "protein_identifier": "Prokka_02349"
                  },
                  "protein_fold": {
                    "quantitation_type": "Peak area",
                    "protein_fold_change": 3.593794108
                  },
                  "control_group": "Proteomics_Man",
                  "experimental_group": "Proteomics_Gly",
                  "metabolite_concentration": "increased"
                },
                {
                  "protein_id": {
                    "protein_database": "uniprot",
                    "protein_identifier": "Prokka_02348"
                  },
                  "protein_fold": {
                    "quantitation_type": "Peak area",
                    "protein_fold_change": 2.030157778
                  },
                  "control_group": "Proteomics_Man",
                  "experimental_group": "Proteomics_Gly",
                  "metabolite_concentration": "increased",
                  "genome": "Salinispora arenicola CNB527"
                }
              ]
            }
        },
        "SMILES": "CCCOC(=O)c1c(C)cc2c(c1O)[C@@]1(O)C(=O)c3cc4c(c(O)c3C(=O)[C@@]1(OC)CC2)C(=O)C=C(N[C@H]1O[C@@H](C)[C@H](O)[C@H](O)[C@H]1OC)C4=O",
        "IUPAC": "methyl (6aR,14aS)-11-[[(2S,3R,4R,5R,6S)-4,5-dihydroxy-3-methoxy-6-methyloxan-2-yl]amino]-1,8,14a-trihydroxy-6a-methoxy-3-methyl-7,9,12,14-tetraoxo-5,6-dihydrobenzo[a]tetracene-2-carboxylate",
        "BGC_ID": {
            "BGC": "MIBiG number associated with this exact BGC",
            "MIBiG_number": "BGC0000198"
        },
        "link": "single molecule",
        "MS2_URL": "ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML",
        "MS2_scan": "977106"
    }]
}
