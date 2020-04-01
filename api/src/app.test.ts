import supertest from 'supertest';
import { Express } from 'express';
import Bull from 'bull';

import { builder } from './app';
import { ProjectDocumentStore, NotFoundException } from './projectdocumentstore';
import { IOMEGAPairedOmicsDataPlatform } from './schema';
import { EnrichedProjectDocument } from './store/enrichments';
import { loadJSONDocument } from './util/io';
import { EXAMPLE_PROJECT_JSON_FN } from './testhelpers';

describe('app', () => {
    let app: Express;
    let store: any;
    let enrichqueue: any;

    describe('with an empty store', () => {
        beforeEach(() => {
            store = {
                listProjects: async () => {
                    return [] as EnrichedProjectDocument[];
                },
                createProject: async () => {
                    return 'projectid1.1';
                },
                listPendingProjects: async () => {
                    return [] as EnrichedProjectDocument[];
                },
                getPendingProject: (project_id: string) => {
                    throw new NotFoundException('Not found ' + project_id);
                }
            };
            enrichqueue = {
                add: jest.fn()
            };
            app = builder(store as ProjectDocumentStore, enrichqueue as Bull.Queue<[string, IOMEGAPairedOmicsDataPlatform]>);
        });

        describe('POST /api/projects', () => {
            describe('with invalid JSON document', () => {
                it('should return 500 error', async () => {
                    const project = { bad: 'document' };
                    const response = await supertest(app)
                        .post('/api/projects')
                        .send(project)
                        .set('Accept', 'application/json')
                        ;
                    expect(response.status).toBe(500);
                    const body = JSON.parse(response.text);
                    const expected: any = [{
                        'dataPath': '',
                        'keyword': 'additionalProperties',
                        'message': 'should NOT have additional properties',
                        'params': { 'additionalProperty': 'bad' },
                        'schemaPath': '#/additionalProperties'
                    }];
                    expect(body).toEqual(expected);

                    expect(enrichqueue.add).toBeCalledTimes(0);
                });
            });

            describe('with valid JSON document', () => {
                it('should return 201 created', async () => {
                    const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
                    const response = await supertest(app)
                        .post('/api/projects')
                        .send(project)
                        .set('Accept', 'application/json')
                        ;
                    expect(response.status).toBe(201);
                    const body = JSON.parse(response.text);
                    const expected: any = {
                        'location': '/api/pending/projects/projectid1.1',
                        'message': 'Created pending project',
                        'project_id': 'projectid1.1'
                    };
                    expect(body).toEqual(expected);

                    expect(enrichqueue.add).toBeCalledWith(['projectid1.1', project]);
                });
            });

        });

        describe('GET /api/projects', () => {
            it('should return zero project summaries', async () => {
                const response = await supertest(app).get('/api/projects');
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    data: []
                };
                expect(body).toEqual(expected);
            });
        });

        describe('GET /api/pending/projects', () => {
            it('should return zero project summaries', async () => {
                const response = await supertest(app)
                    .get('/api/pending/projects')
                    .set('Authorization', 'Bearer ashdfjhasdlkjfhalksdjhflak')
                ;
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    data: []
                };
                expect(body).toEqual(expected);
            });
        });

        describe('GET /api/pending/projects/projectid1.1', () => {
            it('should return project', async () => {
                const response = await supertest(app)
                    .get('/api/pending/projects/projectid1.1')
                    .set('Authorization', 'Bearer ashdfjhasdlkjfhalksdjhflak')
                ;
                expect(response.status).toBe(404);
            });
        });

        describe('GET /api/stats', () => {
            it('should return empty stats', async () => {
                const response = await supertest(app).get('/api/stats');
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    'global': {
                        'projects': 0,
                        'principal_investigators': 0,
                        'metabolome_samples': 0,
                        'bgc_ms2': 0,
                    },
                    'top': {
                        'principal_investigators': [],
                        'submitters': [],
                        'genome_types': [],
                        'instruments_types': [],
                        'growth_media': [],
                        'solvents': [],
                        'species': [],
                        'metagenomic_environment': []
                    }
                };
                expect(body).toEqual(expected);
            });
        });
    });

    describe('with a project in store', () => {
        let project: IOMEGAPairedOmicsDataPlatform;

        beforeEach(async () => {
            project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
            const eproject: EnrichedProjectDocument = {
                _id: 'projectid1.1',
                project
            };
            store = {
                listProjects: async () => {
                    return [eproject];
                },
                createProject: async () => {
                    return 'projectid1.1';
                },
                listPendingProjects: async () => {
                    return [eproject];
                },
                getPendingProject: async () => {
                    return eproject;
                },
                getProject: async () => {
                    return eproject;
                },
                projectHistory: async () => {
                    return {
                        current: project,
                        archived: [
                            ['projectid0', project]
                        ]
                    };
                },
                approveProject: jest.fn(),
                denyProject: jest.fn(),
                editProject: async () => {
                    return 'projectid1.2';
                }
            };
            enrichqueue = {
                add: jest.fn()
            };
            app = builder(store as ProjectDocumentStore, enrichqueue as Bull.Queue<[string, IOMEGAPairedOmicsDataPlatform]>);
        });

        describe('GET /api/pending/projects/projectid1.1', () => {
            it('should return project', async () => {
                const response = await supertest(app)
                    .get('/api/pending/projects/projectid1.1')
                    .set('Authorization', 'Bearer ashdfjhasdlkjfhalksdjhflak')
                ;
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    _id: 'projectid1.1',
                    project
                };
                expect(body).toEqual(expected);
            });
        });

        describe('POST /api/pending/projects/projectid1.1', () => {
            it('should approve project', async () => {
                const response = await supertest(app)
                    .post('/api/pending/projects/projectid1.1')
                    .set('Authorization', 'Bearer ashdfjhasdlkjfhalksdjhflak')
                ;
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    message: 'Approved pending project',
                    location: '/api/projects/projectid1.1'
                };
                expect(body).toEqual(expected);
            });
        });

        describe('DELETE /api/pending/projects/projectid1.1', () => {
            it('should deny project', async () => {
                const response = await supertest(app)
                    .delete('/api/pending/projects/projectid1.1')
                    .set('Authorization', 'Bearer ashdfjhasdlkjfhalksdjhflak')
                ;
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    message: 'Denied pending project'
                };
                expect(body).toEqual(expected);
            });
        });

        describe('GET /api/projects/projectid1.1', () => {
            it('should return project', async () => {
                const response = await supertest(app)
                    .get('/api/projects/projectid1.1')
                ;
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                expect(body).toEqual(project);
            });
        });

        describe('GET /api/projects/projectid1.1/enriched', () => {
            it('should return enriched project', async () => {
                const response = await supertest(app)
                    .get('/api/projects/projectid1.1/enriched')
                ;
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    _id: 'projectid1.1',
                    project
                };
                expect(body).toEqual(expected);
            });
        });

        describe('GET /api/projects/projectid1.1/history', () => {
            it('should return enriched project', async () => {
                const response = await supertest(app)
                    .get('/api/projects/projectid1.1/history')
                ;
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    current: project,
                    archived: [
                        ['projectid0', project]
                    ]
                };
                expect(body).toEqual(expected);
            });
        });

        describe('POST /api/projects/projectid1.1', () => {
            describe('with invalid JSON document', () => {
                it('should return 500 error', async () => {
                    const project = { bad: 'document' };
                    const response = await supertest(app)
                        .post('/api/projects/projectid1.1')
                        .send(project)
                        .set('Accept', 'application/json')
                        ;
                    expect(response.status).toBe(500);
                    const body = JSON.parse(response.text);
                    const expected: any = [{
                        'dataPath': '',
                        'keyword': 'additionalProperties',
                        'message': 'should NOT have additional properties',
                        'params': { 'additionalProperty': 'bad' },
                        'schemaPath': '#/additionalProperties'
                    }];
                    expect(body).toEqual(expected);

                    expect(enrichqueue.add).toBeCalledTimes(0);
                });
            });

            describe('with valid JSON document', () => {
                it('should return 201 created', async () => {
                    const project = await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN);
                    const response = await supertest(app)
                        .post('/api/projects/projectid1.1')
                        .send(project)
                        .set('Accept', 'application/json')
                        ;
                    expect(response.status).toBe(201);
                    const body = JSON.parse(response.text);
                    const expected: any = {
                        'location': '/api/pending/projects/projectid1.2',
                        'message': 'Created pending project',
                        'project_id': 'projectid1.2'
                    };
                    expect(body).toEqual(expected);

                    expect(enrichqueue.add).toBeCalledWith(['projectid1.2', project]);
                });
            });

        });

        describe('GET /api/version', () => {
            it('should return version info', async () => {
                const response = await supertest(app)
                    .get('/api/version')
                ;
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected: any = {
                    dataset: {
                        doi: expect.stringContaining('https://doi.org/10.5281/zenodo'),
                        zenodo: expect.stringContaining('https://zenodo.org/record/'),
                    },
                    api: expect.stringMatching(/\d+\.\d+.\d+/)
                };
                expect(body).toEqual(expected);
            });
        });
    });
});