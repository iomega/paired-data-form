jest.mock('node-fetch');

import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

import { loadJSONDocument, loadDocument } from './io';
import { EXAMPLE_PROJECT_JSON_FN } from '../testhelpers';
import { EnrichedProjectDocument } from '../store/enrichments';
import { publish2zenodo, create_archive } from './publish2zenodo';
import { Parse } from 'unzipper';
import { ProjectDocumentStore } from '../projectdocumentstore';

const mockedfetch = ((fetch as any) as jest.Mock);

describe('publish2zenodo', () => {
    const access_token = 'sometoken';
    const deposition_id = 1234567;

    describe('with a single project in store', () => {
        let store: any;

        beforeAll(async () => {
            const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
            const eproject: EnrichedProjectDocument = {
                _id: 'projectid1.1',
                project
            };
            store = {
                listProjects: async () => {
                    return [eproject];
                }
            };
        });

        describe('to Zenodo sandbox', () => {
            const use_sandbox = true;

            beforeEach(async () => {
                mockedfetch.mockImplementation(async (url) => {
                    if (url === 'https://sandbox.zenodo.org/api/deposit/depositions/1234567/actions/newversion') {
                        const response: any = {
                                'created': '2016-06-15T16:10:03.319363+00:00',
                                'files': [],
                                'id': 1234567,
                                'links': {
                                  'discard': 'https://sandbox.zenodo.org/api/deposit/depositions/1234567/actions/discard',
                                  'edit': 'https://sandbox.zenodo.org/api/deposit/depositions/1234567/actions/edit',
                                  'files': 'https://sandbox.zenodo.org/api/deposit/depositions/1234567/files',
                                  'publish': 'https://sandbox.zenodo.org/api/deposit/depositions/1234567/actions/publish',
                                  'newversion': 'https://sandbox.zenodo.org/api/deposit/depositions/1234567/actions/newversion',
                                  'self': 'https://sandbox.zenodo.org/api/deposit/depositions/1234567',
                                  'latest_draft': 'https://sandbox.zenodo.org/api/deposit/depositions/7654321'
                                },
                                'metadata': {
                                  'prereserve_doi': {
                                    'doi': '10.5072/zenodo.1234567',
                                    'recid': 1234567
                                  }
                                },
                                'modified': '2016-06-15T16:10:03.319371+00:00',
                                'owner': 1,
                                'record_id': 1234567,
                                'state': 'unsubmitted',
                                'submitted': false,
                                'title': ''
                        };
                        const init = {
                            status: 201,
                            statusText: 'Created',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                        return new Response(JSON.stringify(response), init);
                    } else if (url === 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/files') {
                        const response = {
                            id: 'fileid1',
                            filename: 'database.zip',
                            filesize: 168,
                            checksum: '4e74fa271381933159558bf36bed0a50'
                        };
                        const init = {
                            status: 201,
                            statusText: 'Created',
                            headers: {
                                'Content-Type': 'application/json'
                            }
                        };
                        return new Response(JSON.stringify(response), init);
                    } else if (url === 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/actions/publish') {
                        const response: any = {
                            'created': '2016-06-15T16:10:03.319363+00:00',
                            'files': [],
                            'id': 7654321,
                            'links': {
                              'discard': 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/actions/discard',
                              'edit': 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/actions/edit',
                              'files': 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/files',
                              'publish': 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/actions/publish',
                              'newversion': 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/actions/newversion',
                              'self': 'https://sandbox.zenodo.org/api/deposit/depositions/7654321'
                            },
                            'metadata': {
                              'prereserve_doi': {
                                'doi': '10.5072/zenodo.1234567',
                                'recid': 1234567
                              }
                            },
                            'modified': '2016-06-15T16:10:03.319371+00:00',
                            'owner': 1,
                            'record_id': 7654321,
                            'state': 'done',
                            'submitted': true,
                            'title': ''
                    };
                    const init = {
                        status: 202,
                        statusText: 'Accepted',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                        return new Response(JSON.stringify(response), init);
                    }
                    throw new Error('URL not mocked');
                });

                await publish2zenodo(store, access_token, deposition_id, use_sandbox);
            });

            it('should create a new version for the Zenodo deposition id', () => {
                const expected_url = 'https://sandbox.zenodo.org/api/deposit/depositions/1234567/actions/newversion';
                const expected_init = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer sometoken'
                    }
                };
                expect(fetch).toHaveBeenCalledWith(expected_url, expected_init);
            });

            it('should deposit file to Zenodo versioned deposition id', () => {
                const expected_url = 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/files';
                expect(fetch).toBeCalledWith(expected_url, expect.anything());
            });

            it.skip('should have submitted a database.zip file', async () => {
                const expected_url = 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/files';
                const recieved_init = mockedfetch.mock.calls.find(args => args[0] === expected_url)[1];

                // TODO FormData is a stream and can not be read easily
                expect(recieved_init.body).toMatch('database.zip');
                const fn = recieved_init.body.get('name');
                expect(fn).toEqual('database.zip');
            });

            test.todo('should the version to the current date');

            it('should publish new version for the Zenodo deposition', () => {
                const expected_url = 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/actions/publish';
                const expected_init = {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer sometoken'
                    }
                };
                expect(fetch).toBeCalledWith(expected_url, expected_init);
            });

            test.todo('should return the doi of the new version');
        });
    });
});

describe('create_archive()', () => {
    describe('with a single project in store', () => {
        let entries: any[];

        beforeAll(async () => {
            const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
            const eproject: EnrichedProjectDocument = {
                _id: 'projectid1.1',
                project
            };
            const store = {
                listProjects: async () => {
                    return [eproject];
                }
            };
            const archive = await create_archive(store as ProjectDocumentStore);
            const zip = archive.pipe(Parse({forceStream: true} as any));
            entries = [];
            for await (const entry of zip) {
                const content = JSON.parse((await entry.buffer()).toString('utf8'));
                entries.push([entry.path, content]);
            }
        });

        it('should have archive with a single project file packed inside', async () => {
            const expected_entries = [[
                'projectid1.1.json', await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN)
            ]];
            expect(entries).toEqual(expected_entries);
        });
    });
});