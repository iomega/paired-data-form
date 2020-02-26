import { ProjectDocumentStore } from '../projectdocumentstore';
import { EnrichedProjectDocument } from '../store/enrichments';

export interface IStats {
    global: {
        projects: number
        principal_investigators: number
        metabolome_samples: number
    };
    top: {
        principal_investigators: [string, number][]
        genome_types: [string, number][]
        species: [string, number][]
        instruments_types: [string, number][]
        growth_mediums: [string, number][]
        solvents: [string, number][]
    };
}

function countProjectField(projects: EnrichedProjectDocument[], accessor: (project: EnrichedProjectDocument) => string, top_size = 5) {
    const field_counts = new Map<string, number>();
    projects.forEach((project) => {
        const key = accessor(project);
        if (field_counts.has(key)) {
            field_counts.set(key, field_counts.get(key) + 1);
        } else {
            field_counts.set(key, 1);
        }
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
    lookup: Map<string, string>,
    top_size = 5
) {
    const field_counts = new Map<string, number>();
    projects.forEach((project) => {
        const collection = collection_accessor(project);
        // TODO if same key is repeated count as 1 for project or exact
        collection.forEach((row) => {
            let key = lookup.get(field_accessor(row));
            if (!key) {
                key = 'Unknown';
            }
            if (field_counts.has(key)) {
                field_counts.set(key, field_counts.get(key) + 1);
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

function enum2map(choices: any[]) {
    return new Map<string, string>(
        choices.map((c) => [c.enum[0], c.title])
    );
}

function countSolvents(projects: EnrichedProjectDocument[], schema: any, top_size = 5) {
    const lookup_enum = schema.properties.experimental.properties.extraction_methods.items.properties.solvents.items.properties.solvent.anyOf;
    const lookup = enum2map(lookup_enum);
    const field_counts = new Map<string, number>();
    projects.forEach(project => {
        const collection = project.project.experimental.extraction_methods;
        collection.forEach(method => {
            method.solvents.forEach(solvent => {
                const key = lookup.get(solvent.solvent);
                const value = solvent.ratio;
                if (field_counts.has(key)) {
                    field_counts.set(key, field_counts.get(key) + value);
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
                if (field_counts.has(key)) {
                    field_counts.set(key, field_counts.get(key) + 1);
                } else {
                    field_counts.set(key, 1);
                }
            });
        } else {
            // No enrichment use label instead
            project.project.genomes.forEach(genome => {
                const key = genome.genome_label;
                if (field_counts.has(key)) {
                    field_counts.set(key, field_counts.get(key) + 1);
                } else {
                    field_counts.set(key, 1);
                }
            });
        }
    });

    return Array.from(field_counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, top_size);
}

export async function computeStats(store: ProjectDocumentStore, schema: any) {
    const projects = await store.listProjects();

    const principal_investigators = countProjectField(projects, (p) => p.project.personal.PI_name);

    const genome_types_enum: string[] = schema.properties.genomes.items.properties.genome_ID.properties.genome_type.enum;
    const genome_types_lookup = new Map<string, string>(genome_types_enum.map(s => [s, s]));
    const genome_types = countProjectCollectionField(
        projects,
        (p) => p.project.genomes,
        (r) => r.genome_ID.genome_type,
        genome_types_lookup,
        genome_types_lookup.size
    );

    const instruments_type_lookup = enum2map(schema.properties.experimental.properties.instrumentation_methods.items.properties.instrumentation.properties.instrument.anyOf);
    const instruments_types = countProjectCollectionField(
        projects,
        (p) => p.project.experimental.instrumentation_methods,
        (r) => r.instrumentation.instrument,
        instruments_type_lookup,
        instruments_type_lookup.size
    );

    const growth_mediums_oneOf = schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.dependencies.medium_type.oneOf[1].properties.medium.anyOf;
    const growth_mediums_lookup = enum2map(growth_mediums_oneOf);
    const metagenome_medium = 'Not available, sample is metagenome';
    growth_mediums_lookup.set(metagenome_medium, metagenome_medium);
    const growth_mediums = countProjectCollectionField(
        projects,
        (p) => p.project.experimental.sample_preparation,
        (r) => {
            if (r.medium_details.medium_type === 'metagenome') {
                return metagenome_medium;
            }
            return r.medium_details.medium;
        },
        growth_mediums_lookup,
        growth_mediums_lookup.size
    );

    const solvents = countSolvents(projects, schema);
    const metabolome_samples = countMetabolomeSamples(projects);
    const species = countSpecies(projects);

    const stats: IStats = {
        global: {
            projects: projects.length,
            principal_investigators: principal_investigators.total,
            metabolome_samples
        },
        top: {
            principal_investigators: principal_investigators.top,
            genome_types: genome_types.top,
            instruments_types: instruments_types.top,
            growth_mediums: growth_mediums.top,
            solvents: solvents.top,
            species
        }
    };
    return stats;
}
