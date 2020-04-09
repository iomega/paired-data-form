import { loadJSONDocument } from '../util/io';
import { EXAMPLE_PROJECT_JSON_FN } from '../testhelpers';
import { SearchEngine } from './search';
import { Client } from '@elastic/elasticsearch';
jest.mock('@elastic/elasticsearch');

const MockedClient: jest.Mock = Client as any;

describe('new SearchEngine()', () => {
    let index: any;
    let client: any;

    beforeAll(() => {
        client = {
            index: jest.fn(),
            search: jest.fn(),
        };
        MockedClient.mockImplementation(() => client);
        index = new SearchEngine('http://localhost:9200');
    });

    describe('with a single example document', () => {
        beforeAll(async () => {
            const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
            await index.add({
                _id: 'projectid1',
                project
            });
        });

        it('should have called client.index', () => {
            expect(client.index).toHaveBeenCalledWith({
                index: 'podp',
                body: expect.anything()
            });
        });

        it('should have added a document with titles instead of urls for mediums', () => {
            const doc = client.index.mock.calls[0][0].body;

            const mediums = doc.project.experimental.sample_preparation.map((s: any) => s.medium_details.medium);
            const expected_mediums = ['A1 medium', 'R5 medium', 'Mannitol soy flour medium (MS)'];
            expect(mediums).toEqual(expected_mediums);
        });

        it('should have added a document with species scientific names', () => {
            const doc = client.index.mock.calls[0][0].body;

            expect(1).toBe(0);
        });

        it('should have added a document with titles instead of urls for instrument types', () => {
            const doc = client.index.mock.calls[0][0].body;

            expect(1).toBe(0);
        });

        it('should have added a document with titles instead of urls for solvents', () => {
            const doc = client.index.mock.calls[0][0].body;

            expect(1).toBe(0);
        });

        describe('search()', () => {
            const query = 'Justin';
            let hits: any;

            beforeAll(async () => {
                client.search.mockReturnValue({
                    body: {
                        hits: {
                            hits: [{
                                _id: 'projectid1'
                            }]
                        }
                    }
                });
                hits = await index.search(query);
            });

            it('should have called client.search', () => {
                expect(client.search).toHaveBeenCalledWith({
                    index: 'podp',
                    body: {
                        'query': {
                            'simple_query_string': {
                                query
                            }
                        },
                        '_source': false
                    }
                });
            });

            it('should return search results', () => {
                expect(hits).toEqual(['projectid1']);
            });
        });
    });
});