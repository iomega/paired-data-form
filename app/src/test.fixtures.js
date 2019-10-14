/* tslint:disable:object-literal-sort-keys */

export const minimalDoc = {
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

export const kitchenSinkDoc = {
    "version": "1",
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
            "molecular_network": "http://gnps.ucsd.edu/ProteoSAFe/status.jsp?task=c36f90ba29fe44c18e96db802de0c6b9"
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
                        "solvent": "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:17790",
                        "ratio": 1
                    }
                ],
                "extraction_method": "meth"
            },
            {
                "solvents": [
                    {
                        "solvent": "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:46787",
                        "ratio": 0.9,
                        "Other_solvent": "beer"
                    },
                    {
                        "solvent": "https://www.ebi.ac.uk/chebi/searchId.do?chebiId=CHEBI:15377",
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
                    "instrument": "https://bioportal.bioontology.org/ontologies/MS/?p=classes&conceptid=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FMS_1000081"
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
                    "instrument": "https://bioportal.bioontology.org/ontologies/MS/?p=classes&conceptid=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FMS_1000443",
                    "other_instrument": "blackhole"
                },
                "column": "Reverse Phase",
                "mode": "http://purl.obolibrary.org/obo/MS_1000130",
                "instrumentation_method": "bh"
            }
        ]
    },
    "genome_metabolome_links": [
        {
            "genome_label": "Streptomyces sp. CNB091",
            "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML",
            "sample_preparation_label": "agar",
            "extraction_method_label": "meth",
            "instrumentation_method_label": "quad"
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
