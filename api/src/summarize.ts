import { GNPSMassIVE, MetaboLights } from './schema';
import { EnrichedProjectDocument } from './store/enrichments';

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
    score?: number;
}

function isMetaboLights(project: GNPSMassIVE | MetaboLights): project is MetaboLights {
    return ((project as MetaboLights).metabolights_study_id !== undefined);
}

export const summarizeProject = (d: EnrichedProjectDocument): ProjectSummary => {
    const project = d.project;
    let submitters = project.personal.submitter_name || '';
    if (project.personal.submitter_name_secondary) {
        submitters += ' & ' + project.personal.submitter_name_secondary;
    }
    const nr_genomes = project['genomes'] ? project['genomes'].length : 0;
    const nr_proteomes = project['proteomes'] ? project['proteomes'].length : 0;
    const nr_growth_conditions = project['experimental'] && project['experimental']['sample_preparation'] ? project['experimental']['sample_preparation'].length : 0;
    const nr_extraction_methods = project['experimental'] && project['experimental']['extraction_methods'] ? project['experimental']['extraction_methods'].length : 0;
    const nr_instrumentation_methods = project['experimental'] && project['experimental']['instrumentation_methods'] ? project['experimental']['instrumentation_methods'].length : 0;
    const nr_genome_metabolomics_links = project['genome_metabolome_links'] ? project['genome_metabolome_links'].length : 0;
    const nr_genecluster_mspectra_links = project['BGC_MS2_links'] ? project['BGC_MS2_links']!.length : 0;
    const summary = {
        _id: d._id,
        metabolite_id: '',
        PI_name: project['personal']['PI_name']!,
        submitters,
        nr_genomes,
        nr_proteomes,
        nr_growth_conditions,
        nr_extraction_methods,
        nr_instrumentation_methods,
        nr_genome_metabolomics_links,
        nr_genecluster_mspectra_links,
    };
    if (isMetaboLights(project.metabolomics.project)) {
        summary.metabolite_id = project.metabolomics.project.metabolights_study_id;
    } else {
        summary.metabolite_id = project.metabolomics.project.GNPSMassIVE_ID;
    }
    return summary;
};
