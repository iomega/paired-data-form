import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from './schema';

export interface ProjectSummary {
    _id: string;
    metabolite_id: string;
    PI_name: string;
    submitters: string;
    nr_genomes: number;
    nr_proteomes: number;
    nr_growth_conditions: number;
    nr_extraction_methods: number;
    nr_instrumentation_methods: number;
    nr_genome_metabolomics_links: number;
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
