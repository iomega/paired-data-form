import { Client } from '@elastic/elasticsearch';
import { EnrichedProjectDocument } from './enrichments';
import { loadSchema } from '../validate';
import { enum2map } from '../util/stats';

interface Hit {
    _id: string;
    _score: number;
    _source: any;
}

export function expandEnrichedProjectDocument(project: EnrichedProjectDocument, schema: any) {
    const doc = JSON.parse(JSON.stringify(project));

    const growth_media_oneOf = schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.dependencies.medium_type.oneOf[1].properties.medium.anyOf;
    const growth_media_lookup = enum2map(growth_media_oneOf);
    const metagenomic_environment_oneOf = schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.dependencies.medium_type.oneOf[0].properties.metagenomic_environment.oneOf;
    const metagenomic_environment_lookup = enum2map(metagenomic_environment_oneOf);
    doc.project.experimental.sample_preparation.forEach((d: any) => {
        if (d.medium_details.medium_type === 'metagenome') {
            const metagenomic_environment_title = metagenomic_environment_lookup.get(d.medium_details.metagenomic_environment);
            if (metagenomic_environment_title) {
                d.medium_details.metagenomic_environment_title = metagenomic_environment_title;
            }
            // TODO other
        }
        const medium_title = growth_media_lookup.get(d.medium_details.medium);
        if (medium_title) {
            d.medium_details.medium_title = medium_title;
        }
        // TODO other
    });

    const instruments_type_lookup = enum2map(schema.properties.experimental.properties.instrumentation_methods.items.properties.instrumentation.properties.instrument.anyOf);
    doc.project.experimental.instrumentation_methods.forEach((d: any) => {
        const title = instruments_type_lookup.get(d.instrumentation.instrument);
        if (title) {
            d.instrumentation.instrument_title = title;
        }
        // TODO other
    });

    const solvents_lookup_enum = schema.properties.experimental.properties.extraction_methods.items.properties.solvents.items.properties.solvent.anyOf;
    const solvents_lookup = enum2map(solvents_lookup_enum);
    doc.project.experimental.extraction_methods.forEach((m: any) => {
        m.solvents.forEach((d: any) => {
            const title = solvents_lookup.get(d.solvent);
            if (title) {
                d.solvent_title = title;
            }
            // TODO other
        });
    });

    // TODO species label fallback for unenriched project

    delete doc._id;

    return doc;
}

export function collapseHit(hit: Hit): EnrichedProjectDocument {
    const project = hit._source;
    project.project.experimental.sample_preparation.forEach(
        (d: any) => {
            delete d.medium_details.medium_title;
            delete d.medium_details.metagenomic_environment_title;
        }
    );
    project.project.experimental.instrumentation_methods.forEach(
        (d: any) => delete d.instrumentation.instrument_title
    );
    project.project.experimental.extraction_methods.forEach(
        (m: any) => m.solvents.forEach(
            (d: any) => delete d.solvent_title
        )
    );

    project._id = hit._id;

    return project;
}

export type FilterField = 'principal_investigator' | 'submitter' | 'genome_type' | 'species' | 'metagenomic_environment' | 'instrument_type' | 'growth_medium' | 'solvent';

export class SearchEngine {
    private schema: any;
    private client: Client;
    private index: string;

    constructor(node: string, index = 'podp') {
        this.schema = loadSchema();
        this.client = new Client({ node });
        this.index = index;
    }

    async initialize(projects: EnrichedProjectDocument[]) {
        if (!await this.hasIndex()) {
            await this.createIndex();
        }
        await this.addMany(projects);
    }

    private async hasIndex() {
        const index_exists = await this.client.indices.exists({ index: this.index });
        return index_exists.body;
    }

    private async createIndex() {
        // Force all detected integers to be floats
        // Due to dynamic mapping `1` will be mapped to a long while other documents will require a float.
        await this.client.indices.create({
            index: this.index,
            body: {
                mappings: {
                    dynamic_templates: [{
                        floats: {
                            match_mapping_type: 'long',
                            mapping: {
                                type: 'float'
                            }
                        }
                    }]
                }
            }
        });
    }

    async addMany(projects: EnrichedProjectDocument[]) {
        const body = projects.flatMap(p => [
            {
                index: {
                    _index: this.index,
                    _id: p._id
                }
            },
            expandEnrichedProjectDocument(p, this.schema)
        ]);
        await this.client.bulk({ body });
    }

    async add(project: EnrichedProjectDocument) {
        await this.client.index({
            index: this.index,
            id: project._id,
            body: expandEnrichedProjectDocument(project, this.schema)
        });
    }

    async delete(project_identifier: string) {
        await this.client.delete({
            id: project_identifier,
            index: this.index
        });
    }

    async search(query: string) {
        const { body } = await this.client.search({
            index: this.index,
            body: {
                'query': {
                    'simple_query_string': {
                        query
                    }
                }
            }
        });
        const hits: EnrichedProjectDocument[] = body.hits.hits.map(collapseHit);
        return hits;
    }

    async filter(key: FilterField, value: string) {
        const query: any = {};
        if (key === 'submitter') {
            query.bool = {
                should: [{
                    'match': {}
                }, {
                    'match': {}
                }]
            };
            query.bool.should[0].match['project.personal.submitter_name.keyword'] = value;
            query.bool.should[1].match['project.personal.submitter_name_secondary.keyword'] = value;
        } else {
            const key2eskey = {
                principal_investigator: 'project.personal.PI_name.keyword',
                genome_type: 'project.genomes.genome_ID.genome_type.keyword',
                species: 'enrichments.genomes.species.scientific_name.keyword',
                metagenomic_environment: 'project.experimental.sample_preparation.medium_details.metagenomic_environment_title.keyword',
                instrument_type: 'project.experimental.instrumentation_methods.instrumentation.instrument_title.keyword',
                growth_medium: 'project.experimental.sample_preparation.medium_details.medium_title.keyword',
                solvent: 'project.experimental.extraction_methods.solvents.solvent_title.keyword',
            };
            query.match = {};
            query.match[key2eskey[key]] = value;
        }
        const { body } = await this.client.search({
            index: this.index,
            body: {
                query
            }
        });
        const hits: EnrichedProjectDocument[] = body.hits.hits.map(collapseHit);
        return hits;
    }
}