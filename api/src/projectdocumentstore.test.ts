import fs from 'fs';
import os from 'os';
import path from 'path';

import rimraf from 'rimraf';

import { ProjectDocumentStore } from './projectdocumentstore';
import { EnrichedProjectDocument } from './store/enrichments';
import { IOMEGAPairedOmicsDataPlatform } from './schema';
import { loadJSONDocument } from './util/io';
import { EXAMPLE_PROJECT_JSON_FN, mockedElasticSearchClient } from './testhelpers';
import { Client } from '@elastic/elasticsearch';
jest.mock('@elastic/elasticsearch');

const MockedElasticSearchClient: jest.Mock = Client as any;

expect.extend({
    toBeSubdirectoryInDirectory(basename: string, prefix: string) {
        const dir = path.join(prefix, basename);
        const stat = fs.statSync(dir);
        const pass = stat.isDirectory();
        return {
            pass,
            message: () => {
                if (stat.isDirectory && this.isNot) {
                    return `{$dir} directory exists`;
                }
                if (!stat.isDirectory && !this.isNot) {
                    return `{$dir} directory absent`;
                }
            }
        };
    },
});

describe('ProjectDocumentStore', () => {
    let datadir: string;
    let store: ProjectDocumentStore;
    let client: any;

    beforeEach(async () => {
        datadir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdp'));
        client = await mockedElasticSearchClient();
        MockedElasticSearchClient.mockImplementation(() => client);
        store = new ProjectDocumentStore(datadir, '', 'http://localhost:9200');
        await store.initialize();
    });

    afterEach(() => {
        rimraf.sync(datadir);
    });

    describe('empty database', () => {
        it('should have zero approved documents', async () => {
            const expected: EnrichedProjectDocument[] = [];
            expect(await store.listProjects()).toEqual(expected);
        });

        it('should have zero pending documents', async () => {
            const expected: EnrichedProjectDocument[] = [];
            expect(await store.listPendingProjects()).toEqual(expected);
        });

        it('should have created directories in datadir', () => {
            // cast expect to any to be able to custom matcher in Typescript
            (expect('pending') as any).toBeSubdirectoryInDirectory(datadir);
            (expect('approved') as any).toBeSubdirectoryInDirectory(datadir);
            (expect('thrash') as any).toBeSubdirectoryInDirectory(datadir);
            (expect('archive') as any).toBeSubdirectoryInDirectory(datadir);
        });

        it('should have constructed a elastic search client', () => {
            expect(MockedElasticSearchClient).toBeCalledWith({ node: 'http://localhost:9200' });
        });

        describe('when project has been submitted', () => {
            let submitted_project: IOMEGAPairedOmicsDataPlatform;
            let project_id: string;

            beforeEach(async () => {
                submitted_project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
                project_id = await store.createProject(submitted_project, project_id);
            });

            it('should have created a JSON document in the pending directory', async () => {
                expect.assertions(1);

                const fn = path.join(datadir, 'pending', `${project_id}.json`);
                const pending_project = await loadJSONDocument(fn);

                expect(pending_project).toEqual(submitted_project);
            });

            it('should be returned by getPendingProject()', async () => {
                expect.assertions(1);

                const project = (await store.getPendingProject(project_id)).project;
                expect(project).toEqual(submitted_project);
            });

            it('should be listed by listPendingProjects()', async () => {
                expect.assertions(1);

                const projects = await store.listPendingProjects();
                const project_ids = new Set(projects.map(p => p._id));

                expect(project_ids).toEqual(new Set([project_id]));
            });

            describe('addEnrichments()', () => {
                beforeEach(async () => {
                    client.index.mockClear();
                    await store.addEnrichments(project_id, { genomes: {} });
                });

                it('should add enrichments to enrichment store', async () => {
                    const enrichments = await store.enrichment_store.get(project_id);
                    expect(enrichments).toEqual({ genomes: {} });
                });

                it('should not update project in search engine with enrichments', () => {
                    expect(client.index).not.toBeCalled();
                });
            });

            describe('when approved', () => {
                beforeEach(async () => {
                    await store.approveProject(project_id);
                });

                it('should have created a JSON document in the approved directory', async () => {
                    expect.assertions(1);

                    const fn = path.join(datadir, 'approved', `${project_id}.json`);
                    const approved_project = await loadJSONDocument(fn);

                    expect(approved_project).toEqual(submitted_project);
                });

                describe('listProjects()', () => {
                    describe('without arguments', () => {
                        it('should be listed', async () => {
                            expect.assertions(1);

                            const projects = await store.listProjects();
                            const project_ids = new Set(projects.map(p => p._id));

                            expect(project_ids).toEqual(new Set([project_id]));
                        });
                    });

                    describe('with query=Justin', () => {
                        it('should be listed', async () => {
                            expect.assertions(1);

                            const projects = await store.listProjects({
                                query: 'Justin'
                            });
                            const project_ids = new Set(projects.map(p => p._id));

                            expect(project_ids).toEqual(new Set(['projectid1']));
                        });
                    });

                    describe('with filter `principal_investigator=Pieter C. Dorrestein`', () => {
                        it('should be listed', async () => {
                            expect.assertions(1);

                            const projects = await store.listProjects({
                                filter: {
                                    key: 'principal_investigator',
                                    value: 'Pieter C. Dorrestein'
                                }
                            });
                            const project_ids = new Set(projects.map(p => p._id));

                            expect(project_ids).toEqual(new Set(['projectid1']));
                        });
                    });
                });

                describe('addEnrichments()', () => {
                    beforeEach(async () => {
                        client.index.mockClear();
                        await store.addEnrichments(project_id, { genomes: {} });
                    });

                    it('should add enrichments to enrichment store', async () => {
                        const enrichments = await store.enrichment_store.get(project_id);
                        expect(enrichments).toEqual({ genomes: {} });
                    });

                    it('should update project in search engine with enrichments', () => {
                        expect(client.index).toBeCalled();
                        const call = client.index.mock.calls[0][0];
                        expect(call.index).toEqual('podp');
                        expect(call.id).toEqual(project_id);
                        expect(call.body.project).toBeTruthy();
                        expect(call.body.enrichments).toBeTruthy();
                    });
                });

                it('should not be listed by listPendingProjects()', async () => {
                    expect.assertions(1);

                    const projects = await store.listPendingProjects();
                    const project_ids = new Set(projects.map(p => p._id));

                    expect(project_ids).not.toEqual(new Set([project_id]));
                });

                it('should be returned by getProject()', async () => {
                    expect.assertions(1);

                    const project = (await store.getProject(project_id)).project;
                    expect(project).toEqual(submitted_project);
                });

                it('should have a creation date', async () => {
                    const date = await store.projectCreationDate(project_id);
                    expect(date.getFullYear()).toBeGreaterThan(1970);
                });

                describe('when project has been edited', () => {
                    let second_project: IOMEGAPairedOmicsDataPlatform;
                    let second_project_id: string;

                    beforeEach(async () => {
                        second_project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
                        second_project.personal.PI_name = 'edited PI';
                        second_project_id = await store.editProject(project_id, second_project);
                    });

                    it('should have created a JSON document with edited project in the pending directory', async () => {
                        expect.assertions(1);

                        const fn = path.join(datadir, 'pending', `${second_project_id}.json`);
                        const approved_project = await loadJSONDocument(fn);

                        expect(approved_project).toEqual(second_project);
                    });

                    it('should list edited project by listPendingProjects()', async () => {
                        expect.assertions(1);

                        const projects = await store.listPendingProjects();
                        const project_ids = new Set(projects.map(p => p._id));

                        expect(project_ids).toEqual(new Set([second_project_id]));
                    });

                    describe('when edited project has been approved', () => {
                        beforeEach(async () => {
                            await store.approveProject(second_project_id);
                        });

                        it('should have created a JSON document with original project in the archive directory', async () => {
                            expect.assertions(1);

                            const fn = path.join(datadir, 'archive', `${project_id}.json`);
                            const approved_project = await loadJSONDocument(fn);

                            expect(approved_project).toEqual(submitted_project);
                        });

                        it('should have created a JSON document with edited project in the pending directory', async () => {
                            expect.assertions(1);

                            const fn = path.join(datadir, 'approved', `${second_project_id}.json`);
                            const approved_project = await loadJSONDocument(fn);

                            expect(approved_project).toEqual(second_project);
                        });

                        it('should have a history with an archived revision', async () => {
                            expect.assertions(1);

                            const history = await store.projectHistory(second_project_id);

                            const expected = {
                                current: second_project,
                                archived: [
                                    [project_id, submitted_project]
                                ]
                            };
                            expect(history).toEqual(expected);
                        });
                    });

                });
            });

            describe('when denied', () => {
                beforeEach(async () => {
                    await store.denyProject(project_id);
                });

                it('should have created a JSON document in the thrash directory', async () => {
                    expect.assertions(1);

                    const fn = path.join(datadir, 'thrash', `${project_id}.json`);
                    const approved_project = await loadJSONDocument(fn);

                    expect(approved_project).toEqual(submitted_project);
                });

                it('should not be listed by listPendingProjects()', async () => {
                    expect.assertions(1);

                    const projects = await store.listPendingProjects();
                    const project_ids = new Set(projects.map(p => p._id));

                    expect(project_ids).not.toEqual(new Set([project_id]));
                });
            });
        });
    });
});
