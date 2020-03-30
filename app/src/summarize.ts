import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from './schema';

export interface ProjectSummary {
    _id: string;
    GNPSMassIVE_ID: string;
    metabolights_study_id: string;
    PI_name: string;
    submitters: string;
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

export const compareProjectSummary = function(key: string): (a: ProjectSummary, b: ProjectSummary) => number {
    if (key === '_id') {
        return (a, b) => {
            if (a._id < b._id) {
                return -1;
            }
            if (a._id > b._id) {
                return 1;
            }
            return 0;
        }
    } else if (key === 'met_id') {
        return (a, b) => {
            const ia = a.GNPSMassIVE_ID ? a.GNPSMassIVE_ID : a.metabolights_study_id;
            const ib = b.GNPSMassIVE_ID ? b.GNPSMassIVE_ID : b.metabolights_study_id;
            if (ia < ib) {
                return -1;
            }
            if (ia > ib) {
                return 1;
            }
            return 0;
        };
    } else if (key === 'PI_name' || key === 'submitters') {
        return (a, b) => a[key].localeCompare(b[key]);
    } else if (key === 'nr_genomes' || key === 'nr_growth_conditions' || key === 'nr_extraction_methods' || key === 'nr_instrumentation_methods' || key === 'nr_genome_metabolmics_links' || key === 'nr_genecluster_mspectra_links') {
        return (a, b) => {
            return b[key] - a[key];
        };
    }
    throw new TypeError(`${key} is not a property of ProjectSummary`);
};