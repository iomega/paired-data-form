import { loadJSONDocument } from './util/io';

export const EXAMPLE_PROJECT_JSON_FN = '../app/public/examples/paired_datarecord_MSV000078839_example.json';

export async function mockedElasticSearchClient() {
    const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
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
    client.search.mockResolvedValue({
        body: {
            hits: {
                hits: [{
                    _id: 'projectid1',
                    _score: 0.5,
                    _source: {
                        _id: 'projectid1',
                        project
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
