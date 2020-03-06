import fs from 'fs';
import os from 'os';
import path from 'path';

import rimraf from 'rimraf';

import { ProjectDocumentStore } from './projectdocumentstore';
import { EnrichedProjectDocument } from './store/enrichments';
import { IOMEGAPairedDataPlatform } from './schema';
import { loadJSONDocument } from './util/io';
import { EXAMPLE_PROJECT_JSON_FN } from './testhelpers';

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

    beforeEach(async () => {
        datadir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdp'));
        store = new ProjectDocumentStore(datadir, undefined);
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

        describe('when project has been submitted', () => {
            let submitted_project: IOMEGAPairedDataPlatform;
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

                it('should be listed by listProjects()', async () => {
                    expect.assertions(1);

                    const projects = await store.listProjects();
                    const project_ids = new Set(projects.map(p => p._id));

                    expect(project_ids).toEqual(new Set([project_id]));
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

                describe('when project has been edited', () => {
                    let second_project: IOMEGAPairedDataPlatform;
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
