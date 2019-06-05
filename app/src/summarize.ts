import { IOMEGAPairedDataPlatform as ProjectDocument } from './schema';

export interface ProjectSummary {
    _id: string;
    GNPSMassIVE_ID: string;
    PI_name: string;
    nr_genomes: number;
    nr_growth_conditions: number;
    nr_extraction_methods: number;
    nr_instrumentation_methods: number;
    nr_genome_metabolmics_links: number;
    nr_genecluster_mspectra_links: number;
}

export type ProjectListItem = [string, ProjectDocument];

interface Species {
    tax_id: number;
    scientific_name: string;
}

interface GenomeEnrichment {
   url?: string;
   title?: string;
   species?: Species;
}

export interface ProjectEnrichments {
    genomes: GenomeEnrichment[];
}

export interface EnrichedProjectDocument {
    _id: string;
    project: ProjectDocument;
    enrichments: ProjectEnrichments;
}

export const summarizeProject = (d: ProjectListItem): ProjectSummary => {
    return {
        _id: d[0],
        GNPSMassIVE_ID: d[1]['metabolomics']['GNPSMassIVE_ID'],
        PI_name: d[1]['personal']['PI_name']!,
        nr_genomes: d[1]['genomes'].length,
        nr_growth_conditions: d[1]['experimental']['sample_preparation']!.length,
        nr_extraction_methods: d[1]['experimental']['extraction_methods']!.length,
        nr_instrumentation_methods: d[1]['experimental']['instrumentation_methods']!.length,
        nr_genome_metabolmics_links: d[1]['genome_metabolome_links'].length,
        nr_genecluster_mspectra_links: d[1]['BGC_MS2_links']!.length,
    };
};

export const summarizeEnrichedProject = (d: EnrichedProjectDocument): ProjectSummary => {
    const project = d.project;
    return {
        _id: d._id,
        GNPSMassIVE_ID:project['metabolomics']['GNPSMassIVE_ID'],
        PI_name: project['personal']['PI_name']!,
        nr_genomes: project['genomes'].length,
        nr_growth_conditions: project['experimental']['sample_preparation']!.length,
        nr_extraction_methods: project['experimental']['extraction_methods']!.length,
        nr_instrumentation_methods: project['experimental']['instrumentation_methods']!.length,
        nr_genome_metabolmics_links: project['genome_metabolome_links'].length,
        nr_genecluster_mspectra_links: project['BGC_MS2_links']!.length,
    };
};
