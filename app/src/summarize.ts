import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from './schema';

export interface ProjectSummary {
    _id: string;
    GNPSMassIVE_ID: string;
    metabolights_study_id: string;
    PI_name: string;
    submitter_name: string;
    nr_genomes: number;
    nr_growth_conditions: number;
    nr_extraction_methods: number;
    nr_instrumentation_methods: number;
    nr_genome_metabolmics_links: number;
    nr_genecluster_mspectra_links: number;
}

export type ProjectListItem = [string, ProjectDocument];

export interface Species {
    tax_id: number;
    scientific_name: string;
}

export interface GenomeEnrichment {
   url?: string;
   title?: string;
   species?: Species;
}

export interface GenomeEnrichments {
    [key: string]: GenomeEnrichment;
}

export interface ProjectEnrichments {
    genomes: GenomeEnrichments;
}

export interface EnrichedProjectDocument {
    _id: string;
    project: ProjectDocument;
    enrichments?: ProjectEnrichments;
}
