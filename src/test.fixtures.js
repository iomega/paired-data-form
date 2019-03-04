/* tslint:disable:object-literal-sort-keys */

export const minimalDoc = {
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

export const kitchenSinkDoc = {
    "version": "1",
    "personal": {
        "submitter_name": "Stefan Verhoeven"
    },
    "metabolomics": {
        "GNPSMassIVE_ID": "MSV000078839",
        "MaSSIVE_URL": "https://gnps.ucsd.edu/ProteoSAFe/result.jsp?task=a507232a787243a5afd69a6c6fa1e508&view=advanced_view"
    },
    "genomes": [
        {
            "genome_ID": {
                "genome_type": "genome",
                "GenBank_accession": "AL645882",
                "RefSeq_accession": "NC_003888.3"
            },
            "BioSample_accession": "SAMEA3648350",
            "publications": "12000953"
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
            },
            {
                "medium_details": {
                    "medium_type": "liquid",
                    "medium": "other",
                    "Other_medium": "blood"
                },
                "growth_temperature": 1,
                "aeration": "not shaking",
                "metagenome_details": {
                    "environment": "https://bioportal.bioontology.org/ontologies/MEO/?p=classes&conceptid=http%3A%2F%2Fpurl.jp%2Fbio%2F11%2Fmeo%2FMEO_0000393"
                },
                "metagenomic_sample_description": "met sam desc",
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
                "mode": "https://bioportal.bioontology.org/ontologies/MS/?p=classes&conceptid=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FMS_1000130",
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
                "mode": "https://bioportal.bioontology.org/ontologies/MS/?p=classes&conceptid=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2FMS_1000130",
                "instrumentation_method": "bh"
            }
        ]
    },
    "genome_metabolome_links": [
        {
            "genome_ID": "AL645882",
            "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839/spectrum/R5/CNB091_R5_M.mzXML",
            "sample_preparation_label": "agar",
            "extraction_method_label": "meth",
            "instrumentation_method_label": "quad"
        },
        {
            "genome_ID": "AL645882",
            "metabolomics_file": "ftp://massive.ucsd.edu/MSV000078839//spectrum/R5/CNB091_R5_M.mzXML2",
            "sample_preparation_label": "blod",
            "extraction_method_label": "beer",
            "instrumentation_method_label": "bh"
        }
    ]
};