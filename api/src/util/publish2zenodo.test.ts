jest.mock('node-fetch');

import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');

import { loadJSONDocument } from './io';
import { EXAMPLE_PROJECT_JSON_FN } from '../testhelpers';
import { EnrichedProjectDocument } from '../store/enrichments';
import { publish2zenodo, create_archive, current_version } from './publish2zenodo';
import { Parse } from 'unzipper';
import { ProjectDocumentStore } from '../projectdocumentstore';

const mockedfetch = ((fetch as any) as jest.Mock);

const mockedZenodoSandboxAPI = (url: string) => {
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
            'title': 'paired omics data platform dataset'
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
    } else if (url === 'https://sandbox.zenodo.org/api/deposit/depositions/7654321') {
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
                },
                'version': current_version()
            },
            'modified': '2016-06-15T16:10:03.319371+00:00',
            'owner': 1,
            'record_id': 7654321,
            'state': 'unsubmitted',
            'submitted': false,
            'title': 'paired omics data platform dataset'
        };
        const init = {
            status: 200,
            statusText: 'Accepted',
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
                'self': 'https://sandbox.zenodo.org/api/deposit/depositions/7654321',
                'doi': 'https://doi.org/10.5072/zenodo.7654321'
            },
            'metadata': {
                'prereserve_doi': {
                    'doi': '10.5072/zenodo.1234567',
                    'recid': 1234567
                },
                'version': current_version()
            },
            'modified': '2016-06-15T16:10:03.319371+00:00',
            'owner': 1,
            'record_id': 7654321,
            'state': 'done',
            'submitted': true,
            'title': 'paired omics data platform dataset'
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
    throw new Error('URL not mocked, ' + url);
};

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

        describe('against mocked Zenodo sandbox API', () => {
            let doi: string;

            beforeEach(async () => {
                mockedfetch.mockImplementation(mockedZenodoSandboxAPI);

                doi = await publish2zenodo(store, access_token, deposition_id, 'https://sandbox.zenodo.org/api');
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

            it('should set the version to the current date', () => {
                const expected_url = 'https://sandbox.zenodo.org/api/deposit/depositions/7654321';
                const expected_body = {
                    metadata: {
                        version: current_version()
                    }
                };
                const expected_init = {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Bearer sometoken',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(expected_body)
                };
                expect(fetch).toBeCalledWith(expected_url, expected_init);
            });

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

            it('should return the doi of the new version', () => {
                const expected_doi = 'https://doi.org/10.5072/zenodo.7654321';
                expect(doi).toEqual(expected_doi);
            });
        });

        describe('aganst mocked broken Zenodo API', () => {

            describe.each([
                ['when wrong deposition id is given', 'https://sandbox.zenodo.org/api/deposit/depositions/1234567/actions/newversion'],
                ['when upload fails', 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/files'],
                ['when setting version fails', 'https://sandbox.zenodo.org/api/deposit/depositions/7654321'],
                ['when publishing fails', 'https://sandbox.zenodo.org/api/deposit/depositions/7654321/actions/publish']
            ])('should throw error', (why, broken_url) => {
                it(why, async () => {
                    expect.assertions(1);
                    mockedfetch.mockImplementation((url) => {
                        if (url === broken_url) {
                            return new Response('error', {
                                status: 404,
                                statusText: 'Not found'
                            });
                        }
                        return mockedZenodoSandboxAPI(url);
                    });

                    try {
                        await publish2zenodo(store, access_token, deposition_id, 'https://sandbox.zenodo.org/api');
                    } catch (error) {
                        expect(error).toEqual((new Error('Zenodo API communication error: Not found')));
                    }
                });
            });
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
            const zip = archive.pipe(Parse({ forceStream: true } as any));
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