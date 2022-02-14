jest.mock('@iomeg/zenodo-upload');

import fs from 'fs';

import { loadJSONDocument } from './io';
import { EXAMPLE_PROJECT_JSON_FN } from '../testhelpers';
import { EnrichedProjectDocument } from '../store/enrichments';
import { publish2zenodo, create_archive, current_version } from './publish2zenodo';
import { Parse } from 'unzipper';
import { ProjectDocumentStore } from '../projectdocumentstore';
import { file } from 'tmp-promise';

import zenodo_upload from '@iomeg/zenodo-upload';
import { PublishResult } from '@iomeg/zenodo-upload/dist/zenodo_draft';
const mockedZenodoUpload = ((zenodo_upload as any) as jest.Mock);

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
                },
                projectCreationDate: async () => {
                    return new Date('2020-03-27T09:38:40.719Z');
                }
            };
        });

        describe('against mocked Zenodo sandbox API', () => {
            let result: PublishResult;

            beforeEach(async () => {
                mockedZenodoUpload.mockImplementation(async () => {
                    return {
                        id: 7654321,
                        doi: 'https://doi.org/10.5072/zenodo.7654321',
                        html: 'https://sandbox.zenodo.org/record/7654321'
                    };
                });

                result = await publish2zenodo(store, access_token, deposition_id, true);
            });

            it('should call zenodo_upload with a zip file', () => {
                const expected_options = {sandbox: true, checksum: true};
                expect(mockedZenodoUpload).toHaveBeenCalledWith(deposition_id, expect.anything(), current_version(), access_token, expected_options);
                const submitted_file = mockedZenodoUpload.mock.calls[0][1];
                expect(submitted_file).toMatch(/.*database.zip$/);
            });

            it('should return the identifier new version', () => {
                const expected_id = 7654321;
                expect(result.id).toEqual(expected_id);
            });

            it('should return the html url of the new version', () => {
                const expected_url = 'https://sandbox.zenodo.org/record/7654321';
                expect(result.html).toEqual(expected_url);
            });

            it('should return the doi of the new version', () => {
                const expected_doi = 'https://doi.org/10.5072/zenodo.7654321';
                expect(result.doi).toEqual(expected_doi);
            });
        });
    });
});

describe('create_archive()', () => {
    describe('with a single project in store', () => {
        let entries: any[];
        let cleanup: any;

        beforeAll(async () => {
            const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
            const eproject: EnrichedProjectDocument = {
                _id: 'projectid1.1',
                project
            };
            const store = {
                listProjects: async () => {
                    return [eproject];
                },
                projectCreationDate: async () => {
                    return new Date('2020-03-27T09:38:40.000Z');
                }
            };
            const tmpfile = await file();
            cleanup = tmpfile.cleanup;
            await create_archive((store as any) as ProjectDocumentStore, tmpfile.path);
            const zip = fs.createReadStream(tmpfile.path).pipe(Parse({ forceStream: true } as any));
            entries = [];
            for await (const entry of zip) {
                const content = JSON.parse((await entry.buffer()).toString('utf8'));
                const dt = entry.vars.lastModifiedDateTime;
                entries.push([entry.path, content, dt]);
            }
        });

        afterAll(() => {
            cleanup();
        });

        it('should have archive with a single project file packed inside', async () => {
            const expected_entries = [[
                'projectid1.1.json', await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN), new Date('2020-03-27T09:38:40.000Z')
            ]];
            expect(entries).toEqual(expected_entries);
        });
    });
});
