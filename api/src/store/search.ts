import { Client } from '@elastic/elasticsearch';
import { EnrichedProjectDocument } from './enrichments';
import { loadSchema, Lookups } from '../util/schema';

interface Hit {
    _id: string;
    _score: number;
    _source: any;
}

export function expandEnrichedProjectDocument(project: EnrichedProjectDocument, schema: any) {
    const lookups = new Lookups(schema);
    const doc = JSON.parse(JSON.stringify(project));

    doc.project.experimental.sample_preparation.forEach((d: any) => {
        if (d.medium_details.medium_type === 'metagenome') {
            const metagenomic_environment_title = lookups.metagenomic_environment.get(d.medium_details.metagenomic_environment);
            if (metagenomic_environment_title) {
                d.medium_details.metagenomic_environment_title = metagenomic_environment_title;
            }
        }
        const medium_title = lookups.growth_media.get(d.medium_details.medium);
        if (medium_title) {
            d.medium_details.medium_title = medium_title;
        }
    });

    doc.project.experimental.instrumentation_methods.forEach((d: any) => {
        const instrument_title = lookups.instrument.get(d.instrumentation.instrument);
        if (instrument_title) {
            d.instrumentation.instrument_title = instrument_title;
        }
        const mode_title = lookups.ionization_mode.get(d.mode);
        if (mode_title) {
            d.mode_title = mode_title;
        }
        const ionization_type_title =  lookups.ionization_type.get(d.ionization.ionization_type);
        if (ionization_type_title) {
            d.ionization_type_title = ionization_type_title;
        }
    });

    doc.project.experimental.extraction_methods.forEach((m: any) => {
        m.solvents.forEach((d: any) => {
            const title = lookups.solvent.get(d.solvent);
            if (title) {
                d.solvent_title = title;
            }
        });
    });

    if (doc.enrichments && doc.enrichments.genomes) {
        doc.enrichments.genomes = Object.entries(doc.enrichments.genomes).map((keyval: any) => {
            return {...keyval[1], label: keyval[0]};
        });
    }
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
        (d: any) => {
            delete d.instrumentation.instrument_title;
            delete d.mode_title;
            delete d.ionization_type_title;
        }
    );
    project.project.experimental.extraction_methods.forEach(
        (m: any) => m.solvents.forEach(
            (d: any) => delete d.solvent_title
        )
    );

    if (project.enrichments && project.enrichments.genomes) {
        const array = project.enrichments.genomes;
        const object: any = {};
        array.forEach((item: any) => {
            object[item.label] = item;
            delete item.label;
        });
        project.enrichments.genomes = object;
    }

    project._id = hit._id;

    return project;
}

export type FilterField = 'principal_investigator' | 'submitter' | 'genome_type' | 'species' | 'metagenomic_environment' | 'instrument_type' | 'ionization_mode' | 'ionization_type' | 'growth_medium' | 'solvent';

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
        await this.deleteIndex();
        await this.createIndex();
        await this.addMany(projects);
    }

    private async deleteIndex() {
        await this.client.indices.delete({
            index: this.index,
            ignore_unavailable: true
        });
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
        if (projects.length === 0) {
            return;
        }
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
        const body = expandEnrichedProjectDocument(project, this.schema);
        await this.client.index({
            index: this.index,
            id: project._id,
            body
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
                ionization_mode: 'project.experimental.instrumentation_methods.mode_title.keyword',
                ionization_type: 'project.experimental.instrumentation_methods.ionization_type_title.keyword',
                growth_medium: 'project.experimental.sample_preparation.medium_details.medium_title.keyword',
                solvent: 'project.experimental.extraction_methods.solvents.solvent_title.keyword',
            };
            const eskey = key2eskey[key];
            if (!eskey) {
                throw new Error('Invalid filter field');
            }
            query.match = {};
            query.match[eskey] = value;
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