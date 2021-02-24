import supertest from 'supertest';
import { Express } from 'express';
import Bull from 'bull';
import { parseStringPromise } from 'xml2js';

import { builder } from './app';
import { ProjectDocumentStore, NotFoundException } from './projectdocumentstore';
import { IOMEGAPairedOmicsDataPlatform } from './schema';
import { EnrichedProjectDocument } from './store/enrichments';
import { loadJSONDocument } from './util/io';
import { EXAMPLE_PROJECT_JSON_FN } from './testhelpers';

jest.mock('./util/secrets', () => {
    return {
        SHARED_TOKEN: 'ashdfjhasdlkjfhalksdjhflak',
        SLACK_ENABLED: false,
        ZENODO_UPLOAD_ENABLED: false,
    };
});

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
                searchProjects: jest.fn().mockImplementation(async () => {
                    const data: EnrichedProjectDocument[] = [];
                    return {
                        data,
                        total: 0
                    };
                }),
                createProject: async () => {
                    return 'projectid1.1';
                },
                listPendingProjects: async () => {
                    return [] as EnrichedProjectDocument[];
                },
                getPendingProject: (project_id: string) => {
                    throw new NotFoundException('Not found ' + project_id);
                },
                health: async () => {
                    return {
                        search: true,
                        redis: true,
                        disk: true,
                    };
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
                    data: [],
                    total: 0
                };
                expect(body).toEqual(expected);
            });

            describe.each([
                ['/api/projects', { size: 100, from: 0 }],
                ['/api/projects?size=12', { size: 12, from: 0 }],
                ['/api/projects?page=2', { size: 100, from: 200 }],
                ['/api/projects?size=12&page=3', { size: 12, from: 36 }],
                ['/api/projects?sort=nr_genomes', { size: 100, from: 0, sort: 'nr_genomes' }],
                ['/api/projects?order=asc', { size: 100, from: 0, order: 'asc' }],
                ['/api/projects?sort=nr_genomes&order=desc', { size: 100, from: 0, sort: 'nr_genomes', order: 'desc' }],
                ['/api/projects?q=Justin', { query: 'Justin', size: 100, from: 0 }],
                ['/api/projects?q=Justin&size=12&page=3', { query: 'Justin', size: 12, from: 36 }],
                ['/api/projects?fk=species&fv=somevalue', { filter: { key: 'species', value: 'somevalue' }, size: 100, from: 0 }],
                ['/api/projects?fk=species&fv=somevalue&size=12&page=3', { filter: { key: 'species', value: 'somevalue' }, size: 12, from: 36 }],
                ['/api/projects?q=Justin&fk=species&fv=somevalue', { query: 'Justin', filter: { key: 'species', value: 'somevalue' }, size: 100, from: 0 }],
            ])('GET %s', (url, expected) => {
                it('should call store.searchProjects', async () => {
                    await supertest(app).get(url);
                    expect(store.searchProjects).toBeCalledWith(expected);
                });
            });

            describe.each([
                ['/api/projects?fk=wrongfield&fv=somevalue', 'Invalid `fk`'],
                ['/api/projects?fk=species', 'Require both `fk` and `fv` to filter'],
                ['/api/projects?fv=somevalue', 'Require both `fk` and `fv` to filter'],
                ['/api/projects?size=foo', 'Size is not an integer'],
                ['/api/projects?size=-10', 'Size must be between `1` and `1000`'],
                ['/api/projects?size=1110', 'Size must be between `1` and `1000`'],
                ['/api/projects?page=foo', 'Page is not an integer'],
                ['/api/projects?page=-10', 'Page must be between `0` and `1000`'],
                ['/api/projects?page=1111', 'Page must be between `0` and `1000`'],
                ['/api/projects?sort=somebadfield', 'Invalid `sort`'],
                ['/api/projects?order=somebadorder', 'Invalid `order`, must be either `desc` or `asc`'],
            ])('GET %s', (url, expected) => {
                let response: any;

                beforeEach(async () => {
                    response = await supertest(app).get(url);
                });

                it('should return a 400 status', () => {
                    expect(response.status).toBe(400);
                });

                it('should return an error message', () => {
                    const body = JSON.parse(response.text);
                    expect(body.message).toEqual(expected);
                });
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

        describe('GET /api/pending/projects/projectid1.1 with incorrect token', () => {
            it('should unauthenticated error', async () => {
                const response = await supertest(app)
                    .get('/api/pending/projects/projectid1.1')
                    .set('Authorization', 'Bearer incorrecttoken')
                    ;
                expect(response.status).toBe(401);
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
                        'instrument_types': [],
                        'ionization_modes': [],
                        'growth_media': [],
                        'solvents': [],
                        'species': [],
                        'metagenomic_environment': []
                    }
                };
                expect(body).toEqual(expected);
            });
        });

        describe('GET /api/health', () => {
            it('should have status=pass', async () => {
                const response = await supertest(app).get('/api/health');
                expect(response.status).toBe(200);
                const body = JSON.parse(response.text);
                const expected = {
                    'status': 'pass',
                    'checks': {
                        'app': {
                            'status': 'pass'
                        },
                        'api': {
                            'status': 'pass'
                        },
                        'elasticsearch': {
                            'status': 'pass'
                        },
                        'redis': {
                            'status': 'pass'
                        },
                        'disk': {
                            'status': 'pass'
                        }
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
                searchProjects: async () => {
                    return {
                        data: [eproject],
                        total: 1
                    };
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

        describe('GET /api/sitemap', () => {
            it('should return a sitemap with projectid1.1 url', async () => {
                const response = await supertest(app)
                    .get('/api/sitemap')
                    ;

                expect(response.status).toBe(200);
                const sitemap = await parseStringPromise(response.text);
                const expected = {
                    urlset: {
                        '$': {
                            xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
                            'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
                            'xmlns:news': 'http://www.google.com/schemas/sitemap-news/0.9',
                            'xmlns:video': 'http://www.google.com/schemas/sitemap-video/1.1',
                            'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
                        },
                        url: [{
                            changefreq: ['yearly'],
                            loc: ['https://pairedomicsdata.bioinformatics.nl/projects/projectid1.1'],
                            priority: ['0.5']
                        }]
                    }
                };
                expect(sitemap).toEqual(expected);
            });
        });
    });
});
