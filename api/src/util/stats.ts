import { BiosyntheticGeneClusterMSMSLinks } from '../schema';
import { EnrichedProjectDocument } from '../store/enrichments';
import { Lookups } from './schema';

export interface IStats {
    global: {
        projects: number
        principal_investigators: number
        metabolome_samples: number
        bgc_ms2: number
    };
    top: {
        principal_investigators: [string, number][]
        submitters: [string, number][]
        genome_types: [string, number][]
        species: [string, number][]
        metagenomic_environment: [string, number][]
        proteome_types: [string, number][]
        instrument_types: [string, number][]
        ionization_modes: [string, number][]
        growth_media: [string, number][]
        solvents: [string, number][]
    };
}

function countProjectField(projects: EnrichedProjectDocument[], accessor: (project: EnrichedProjectDocument) => Map<string, number>, top_size = 5) {
    const field_counts = new Map<string, number>();
    projects.forEach((project) => {
        const keys = accessor(project);
        keys.forEach((value, key) => {
            const count = field_counts.get(key);
            if (count) {
                field_counts.set(key, count + value);
            } else {
                field_counts.set(key, value);
            }
        });
    });
    // Sort by count and take top n largest counts
    const top = Array.from(field_counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, top_size);
    return {
        total: field_counts.size,
        top
    };
}

function countProjectCollectionField(
    projects: EnrichedProjectDocument[],
    collection_accessor: (project: EnrichedProjectDocument) => any[],
    field_accessor: (row: any) => string,
    lookup: ReadonlyMap<string, string>,
    top_size = 5,
    { count_unknowns } = { count_unknowns: true }
) {
    const field_counts = new Map<string, number>();
    projects.forEach((project) => {
        const collection = collection_accessor(project);
        // TODO if same key is repeated count as 1 for project or exact
        collection.forEach((row) => {
            let key = lookup.get(field_accessor(row));
            if (!key) {
                if (!count_unknowns) {
                    return;
                }
                key = 'Unknown';
            }
            const count = field_counts.get(key);
            if (count) {
                field_counts.set(key, count + 1);
            } else {
                field_counts.set(key, 1);
            }
        });
    });

    // Sort by count, take top n largest counts and replace url by title
    const top: [string, number][] = Array.from(field_counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, top_size)
        ;
    return {
        total: field_counts.size,
        top
    };
}

function countSolvents(projects: EnrichedProjectDocument[], lookup: ReadonlyMap<string, string>, top_size = 5) {
    const field_counts = new Map<string, number>();
    projects.forEach(project => {
        const collection = project.project.experimental.extraction_methods;
        if (!collection) {
            return;
        }
        collection.forEach(method => {
            if (!method.solvents) {
                return;
            }
            method.solvents.forEach(solvent => {
                const key = lookup.get(solvent.solvent);
                if (!key) {
                    return;
                }
                const value = solvent.ratio;
                const count = field_counts.get(key);
                if (count) {
                    field_counts.set(key, count + value);
                } else {
                    field_counts.set(key, value);
                }
            });
        });
    });
    const top: [string, number][] = Array.from(field_counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, top_size)
        ;
    return {
        total: field_counts.size,
        top
    };
}

function countMetabolomeSamples(projects: EnrichedProjectDocument[]) {
    const set = new Set<string>();

    projects.forEach(project => {
        project.project.genome_metabolome_links.forEach(link => {
            set.add(link.metabolomics_file);
        });
    });

    return set.size;
}

function countSpecies(projects: EnrichedProjectDocument[], top_size = 5) {
    const field_counts = new Map<string, number>();

    projects.forEach(project => {
        if (project.enrichments && project.enrichments.genomes && Object.values(project.enrichments.genomes).length) {
            Object.values(project.enrichments.genomes).forEach(genome => {
                const key = genome.species.scientific_name;
                const count = field_counts.get(key);
                if (count) {
                    field_counts.set(key, count + 1);
                } else {
                    field_counts.set(key, 1);
                }
            });
        } else {
            // No enrichment use label instead
            project.project.genomes.forEach(genome => {
                const key = genome.genome_label;
                const count = field_counts.get(key);
                if (count) {
                    field_counts.set(key, count + 1);
                } else {
                    field_counts.set(key, 1);
                }
            });
        }
    });

    return Array.from(field_counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, top_size);
}

type GeneClusterMassSpectraLink = BiosyntheticGeneClusterMSMSLinks[0];

function hash_bgcms2_link(link: GeneClusterMassSpectraLink) {
    if (link.link === 'GNPS molecular family') {
        if (link.BGC_ID.BGC === 'MIBiG number associated with this exact BGC') {
            return link.network_nodes_URL + link.BGC_ID.MIBiG_number;
        } else if (link.BGC_ID.BGC === 'MIBiG number of a similar BGC from a closely related strain') {
            return link.network_nodes_URL + link.BGC_ID.similar_MIBiG_number + link.BGC_ID.strain + link.BGC_ID.coordinates;
        }
    } else if (link.link === 'single molecule') {
        if (link.BGC_ID.BGC === 'MIBiG number associated with this exact BGC') {
            return link.MS2_URL + link.MS2_scan + link.BGC_ID.MIBiG_number;
        } else if (link.BGC_ID.BGC === 'MIBiG number of a similar BGC from a closely related strain') {
            return link.MS2_URL + link.MS2_scan + link.BGC_ID.similar_MIBiG_number + link.BGC_ID.strain + link.BGC_ID.coordinates;
        }
    }
}

function countBgcMS2Links(projects: EnrichedProjectDocument[]) {
    const field_counts = new Set<string>();

    projects.forEach(project => {
        if (project.project.BGC_MS2_links) {
            project.project.BGC_MS2_links.map(hash_bgcms2_link).forEach((link) => {
                field_counts.add(link);
            });
        }
    });

    return field_counts.size;
}

export function computeStats(projects: EnrichedProjectDocument[], schema: any): IStats {
    const lookups = new Lookups(schema);

    const principal_investigators = countProjectField(projects,
        (p) => new Map([[p.project.personal.PI_name ? p.project.personal.PI_name : '', 1]])
    );
    const submitters = countProjectField(projects, (p) => {
        const submitters_values =  new Map<string, number>();
        if (p.project.personal.submitter_name) {
            if (p.project.personal.submitter_name_secondary) {
                // The primary and secondary submitter each contributed to a project
                // so the count of a submtter is the number of projects he/she submitted.
                submitters_values.set(p.project.personal.submitter_name, 1);
                submitters_values.set(p.project.personal.submitter_name_secondary, 1);
            } else {
                submitters_values.set(p.project.personal.submitter_name, 1);
            }
        }
        return new Map(submitters_values);
    });

    const genome_types = countProjectCollectionField(
        projects,
        (p) => p.project.genomes,
        (r) => r.genome_ID.genome_type,
        lookups.genome_type,
        lookups.genome_type.size,
    );

    const proteome_types = countProjectCollectionField(
        projects,
        (p) => p.project.proteomes ? p.project.proteomes : [],
        (r) => {
            if (r.proteome_ID.proteome_type === 'Enriched') {
                const targets = r.proteome_ID.targets;
                return 'Enriched: ' + targets.map((t: any) => {
                    if (t.target === 'other') {
                        return t.other_target;
                    } else {
                        return t.target;
                    }
                }).join(', ');
            }
            return r.proteome_ID.proteome_type;
        },
        lookups.proteome_types,
        lookups.proteome_types.size
    );

    const instrument_types = countProjectCollectionField(
        projects,
        (p) => p.project.experimental.instrumentation_methods,
        (r) => r.instrumentation.instrument,
        lookups.instrument,
        lookups.instrument.size
    );
    const ionization_modes = countProjectCollectionField(
        projects,
        (p) => p.project.experimental.instrumentation_methods,
        (r) => r.mode,
        lookups.ionization_mode,
        lookups.ionization_mode.size
    );

    const metagenome_medium = 'Not available, sample is metagenome';
    lookups.growth_media.set(metagenome_medium, metagenome_medium);
    const growth_media = countProjectCollectionField(
        projects,
        (p) => p.project.experimental.sample_preparation,
        (r) => {
            if (r.medium_details.medium_type === 'metagenome') {
                return metagenome_medium;
            }
            return r.medium_details.medium;
        },
        lookups.growth_media,
        lookups.growth_media.size
    );
    const metagenomic_environment = countProjectCollectionField(
        projects,
        (p) => p.project.experimental.sample_preparation,
        (r) => {
            if (r.medium_details.medium_type === 'metagenome') {
                return r.medium_details.metagenomic_environment;
            }
        },
        lookups.metagenomic_environment,
        lookups.metagenomic_environment.size,
        { count_unknowns: false }
    );

    const solvents = countSolvents(projects, lookups.solvent);
    const metabolome_samples = countMetabolomeSamples(projects);
    const species = countSpecies(projects);

    const bgc_ms2 = countBgcMS2Links(projects);

    return {
        global: {
            projects: projects.length,
            principal_investigators: principal_investigators.total,
            metabolome_samples,
            bgc_ms2
        },
        top: {
            principal_investigators: principal_investigators.top,
            submitters: submitters.top,
            genome_types: genome_types.top,
            proteome_types: proteome_types.top,
            instrument_types: instrument_types.top,
            ionization_modes: ionization_modes.top,
            growth_media: growth_media.top,
            solvents: solvents.top,
            species,
            metagenomic_environment: metagenomic_environment.top
        }
    };
}
