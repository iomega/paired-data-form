import { Client } from '@elastic/elasticsearch';
import { EnrichedProjectDocument } from './enrichments';
import { loadSchema } from '../validate';
import { enum2map } from '../util/stats';

interface Hit {
    _id: string;
}

export const map2fullTextDocument = (project: EnrichedProjectDocument, schema: any) => {
    const doc = JSON.parse(JSON.stringify(project));

    const growth_media_oneOf = schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.dependencies.medium_type.oneOf[1].properties.medium.anyOf;
    const growth_media_lookup = enum2map(growth_media_oneOf);
    doc.project.experimental.sample_preparation.forEach((s: any) => {
        if (s.medium_details.medium) {
            s.medium_details.medium = growth_media_lookup.get(s.medium_details.medium);
        }
    });

    // TODO replace url with title from schema
    return doc;
};

type FilterField = 'principal_investigator' | 'submitter' | 'genome_type' | 'species' | 'metagenomic_environment' | 'instrument_type' | 'growth_medium' | 'solvent';

export class SearchEngine {
    private schema: any;
    private client: Client;
    private index: string;

    constructor(node: string, index = 'podp') {
        this.schema = loadSchema();
        this.client = new Client({ node });
        this.index = index;
    }

    async add(project: EnrichedProjectDocument) {
        await this.client.index({
            index: this.index,
            body: map2fullTextDocument(project, this.schema)
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
                },
                '_source': false
            }
        });
        return body.hits.hits.map((h: Hit) => h._id);
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
                metagenomic_environment: 'project.experimental.sample_preparation.medium_details.metagenomic_environment.keyword',
                instrument_type: 'project.experimental.instrumentation_methods.instrumentation.instrument.keyword',
                growth_medium: 'project.experimental.sample_preparation.medium_details.medium.keyword',
                solvent: 'project.experimental.extraction_methods.solvents.solvent.keyword',
            };
            query.match = {};
            query.match[key2eskey[key]] = value;
        }
        const { body } = await this.client.search({
            index: this.index,
            body: {
                query,
                '_source': false
            }
        });
        return body.hits.hits.map((h: Hit) => h._id);
    }
}