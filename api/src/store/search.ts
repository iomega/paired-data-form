import { Client } from '@elastic/elasticsearch';
import { EnrichedProjectDocument } from './enrichments';
import { loadSchema, Lookups } from '../util/schema';
import { summarizeProject, ProjectSummary } from '../summarize';

export interface SearchOptions {
    query?: string;
    filter?: {
        key: FilterField;
        value: string;
    };
    from?: number;
    size?: number;
    sort?: SortField;
    order?: Order;
}

export enum FilterFields {
    principal_investigator = 'project.personal.PI_name.keyword',
    submitter = 'summary.submitters.keyword',
    genome_type = 'project.genomes.genome_ID.genome_type.keyword',
    species = 'enrichments.genomes.species.scientific_name.keyword',
    metagenomic_environment = 'project.experimental.sample_preparation.medium_details.metagenomic_environment_title.keyword',
    instrument_type = 'project.experimental.instrumentation_methods.instrumentation.instrument_title.keyword',
    ionization_mode = 'project.experimental.instrumentation_methods.mode_title.keyword',
    ionization_type = 'project.experimental.instrumentation_methods.ionization_type_title.keyword',
    growth_medium = 'project.experimental.sample_preparation.medium_details.medium_title.keyword',
    solvent = 'project.experimental.extraction_methods.solvents.solvent_title.keyword',
}

export type FilterField = keyof typeof FilterFields;

export enum SortFields {
    score = 'score',
    _id = 'project_id.keyword',
    met_id = 'summary.metabolite_id.keyword',
    PI_name = 'summary.PI_name.keyword',
    submitters = 'summary.submitters.keyword',
    nr_genomes = 'summary.nr_genomes',
    nr_growth_conditions = 'summary.nr_growth_conditions',
    nr_extraction_methods = 'summary.nr_extraction_methods',
    nr_instrumentation_methods = 'summary.nr_instrumentation_methods',
    nr_genome_metabolomics_links = 'summary.nr_genome_metabolomics_links',
    nr_genecluster_mspectra_links = 'summary.nr_genecluster_mspectra_links',
}
export type SortField = keyof typeof SortFields;

export enum Order {
    desc = 'desc',
    asc = 'asc'
}

export const DEFAULT_PAGE_SIZE = 100;

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
        const ionization_type_title = lookups.ionization_type.get(d.ionization.ionization_type);
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
            return { ...keyval[1], label: keyval[0] };
        });
    }
    // TODO species label fallback for unenriched project

    doc.summary = summarizeProject(project);
    delete doc.summary._id;
    // To sort on _id we need to store id in es, but es does not like _id name
    // so storing as project_id
    doc.project_id = doc._id;
    delete doc._id;
    return doc;
}

export function collapseHit(hit: Hit): ProjectSummary {
    const summary = hit._source.summary;
    if (hit._score) {
        summary.score = hit._score;
    }
    summary._id = hit._id;
    delete hit._source.project_id;
    return summary;
}

function buildAll() {
    return {
        match_all: {}
    };
}

function buildQuery(query: string) {
    return {
        'simple_query_string': {
            query
        }
    };
}

function buildFilter(key: FilterField, value: string) {
    const eskey = FilterFields[key];
    if (!eskey) {
        throw new Error('Invalid filter field');
    }
    const match: { [key: string]: string } = {};
    match[eskey] = value;
    return {
        match
    };
}

function buildQueryFilter(query: any, filter: any) {
    return {
        bool: {
            must: query,
            filter
        }
    };
}

function buildBody(options: SearchOptions) {
    if (options.query && options.filter) {
        return buildQueryFilter(
            buildQuery(options.query),
            buildFilter(options.filter.key, options.filter.value)
        );
    } else if (options.query) {
        return buildQuery(options.query);
    } else if (options.filter) {
        return buildFilter(options.filter.key, options.filter.value);
    } else {
        return buildAll();
    }
}

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
        // Force all detected integers to be floats except fields that start with nr_
        // Due to dynamic mapping `1` will be mapped to a long while other documents will require a float.
        await this.client.indices.create({
            index: this.index,
            body: {
                mappings: {
                    dynamic_templates: [{
                        floats: {
                            unmatch: 'nr_*',
                            match_mapping_type: 'long',
                            mapping: {
                                type: 'float'
                            }
                        }
                    }]
                },
                settings: {
                    number_of_replicas: 0
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

    async health() {
        try {
            const response = await this.client.cluster.health({
                index: this.index,
                level: 'indices'
            });
            const cluster_status = response.body.status;
            if (!(this.index in response.body.indices)) {
                return false;
            }
            const index_status = response.body.indices[this.index].status;
            return cluster_status === 'green' && index_status === 'green';
        } catch (error) {
            console.error('es health failure: ', error);
            return false;
        }
    }

    async search(options: SearchOptions) {
        const defaultSort = (options.query || options.filter) ? 'score' : 'met_id';
        const {
            size = DEFAULT_PAGE_SIZE,
            from = 0,
            sort = defaultSort,
            order = Order.desc
        } = options;
        const qbody = buildBody(options);
        return this._search(qbody, size, from, sort, order);
    }

    private async _search(query: any, size: number, from: number, sort: SortField, order: Order) {
        const request: any = {
            index: this.index,
            size: size,
            from,
            _source: 'summary',
            body: {
                query
            }
        };
        if (sort && sort !== 'score') {
            request.sort = SortFields[sort] + ':' + order;
        }
        const response = await this.client.search(request);
        const data: ProjectSummary[] = response.body.hits.hits.map(collapseHit);
        const total: number = response.body.hits.total.value;
        return { data, total };
    }
}
