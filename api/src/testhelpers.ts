import { loadJSONDocument } from './util/io';

export const EXAMPLE_PROJECT_JSON_FN = '../app/public/examples/paired_datarecord_MSV000078839_example.json';

export async function mockedElasticSearchClient() {
    const client = {
        indices: {
            delete: jest.fn(),
            create: jest.fn()
        },
        index: jest.fn(),
        bulk: jest.fn(),
        search: jest.fn(),
        delete: jest.fn(),
    };
    const summary = {
        metabolite_id: 'MSV000078839',
        PI_name: 'Marnix Medema',
        submitters: 'Justin van der Hooft',
        nr_extraction_methods: 3,
        nr_genecluster_mspectra_links: 3,
        nr_genome_metabolomics_links: 21,
        nr_genomes: 3,
        nr_growth_conditions: 3,
        nr_instrumentation_methods: 1,
    };
    client.search.mockResolvedValue({
        body: {
            hits: {
                hits: [{
                    _id: 'projectid1',
                    _score: 0.5,
                    _source: {
                        _id: 'projectid1',
                        summary
                    }
                }],
                total: {
                    value: 1
                }
            }
        }
    });
    return client;
}
