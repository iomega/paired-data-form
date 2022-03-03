import { enrichAllProjects, publish2zenodoTask, buildEnrichQueue, scheduledZenodoUploads } from './tasks';
import { ProjectDocumentStore } from './projectdocumentstore';
import { loadJSONDocument } from './util/io';
import { EXAMPLE_PROJECT_JSON_FN } from './testhelpers';
import { enrich } from './enrich';
import mocked_zenodo_upload from '@iomeg/zenodo-upload';
import mockedBull from 'bull';
import { notifyPublish2Zenodo } from './util/notify';

jest.mock('./enrich');
jest.mock('@iomeg/zenodo-upload');
jest.mock('bull');
jest.mock('./util/notify');

describe('with mocked store', () => {
    let store: any;

    beforeEach(() => {
        (enrich as jest.Mock).mockImplementation(() => {
            return 'MockedEnrichments';
        });
        store = {
            listProjects: async () => {
                return [{
                    _id: 'projectid1.1',
                    project: await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN)
                }];
            },
            listPendingProjects: async () => {
                return [{
                    _id: 'projectid2.1',
                    project: await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN)
                }];
            },
            projectCreationDate: () => new Date(2020, 4, 2),
            addEnrichments: jest.fn()
        };
    });

    describe('buildEnrichQueue', () => {
        let queue: any;

        beforeEach(() => {
            (mockedBull as jest.Mock).mockImplementation(() => {
                return {
                    process: jest.fn(),
                    on: jest.fn()
                };
            });
            queue = buildEnrichQueue(store);
        });

        it('should create a queue', () => {
            expect(mockedBull).toHaveBeenCalledWith('enrichqueue', 'redis://127.0.0.1:6379');
        });

        it('should return a queue', () => {
            expect(queue).toBeDefined();
        });

        it.each([
            ['error'],
            ['failed'],
            ['stalled']
        ])('listens on %s event', (event) => {
            expect(queue.on).toHaveBeenCalledWith(event, expect.anything());
        });

        it('register process function', () => {
            expect(queue.process).toHaveBeenCalled();
        });
    });

    describe('enrichAllProjects()', () => {

        beforeEach(async () => {
            await enrichAllProjects(store as ProjectDocumentStore);
        });

        it('should store enrichments of approved project', () => {
            expect(store.addEnrichments).toBeCalledWith('projectid1.1', 'MockedEnrichments');
        });

        it('should store enrichments of pending project', () => {
            expect(store.addEnrichments).toBeCalledWith('projectid2.1', 'MockedEnrichments');
        });
    });

    describe('scheduledZenodoUploads()', () => {
        let queue: any;

        beforeEach(() => {
            queue = {
                process: jest.fn(),
                on: jest.fn(),
                add: jest.fn()
            };
            (mockedBull as jest.Mock).mockImplementation(() => queue);
            scheduledZenodoUploads(store);
        });

        it('should create a queue', () => {
            expect(mockedBull).toHaveBeenCalledWith('zenodoupload', 'redis://127.0.0.1:6379');
        });

        it('should have monthly schedule', () => {
            expect(queue.add).toHaveBeenCalledWith([], { repeat: { cron: '0 0 1 * *' } });
        });

        it.each([
            ['error'],
            ['failed'],
            ['stalled'],
        ])('listens on %s event', (event) => {
            expect(queue.on).toHaveBeenCalledWith(event, expect.anything());
        });

        it('register process function', () => {
            expect(queue.process).toHaveBeenCalled();
        });
    });

    describe('publish2zenodoTask()', () => {
        describe('successful publish', () => {
            let result: any;

            beforeAll(async () => {
                (mocked_zenodo_upload as jest.Mock).mockImplementation(async () => {
                    return {
                        id: 'someid',
                        doi: 'somedoi',
                        html: 'somehtmlurl'
                    };
                });

                result = await publish2zenodoTask(store);
            });

            it('should have called zenodo_upload', () => {
                expect(mocked_zenodo_upload).toHaveBeenCalledWith(
                    -1,
                    expect.stringMatching(/database.zip$/),
                    expect.stringMatching(/\d\d\d\d-\d\d-\d\d/),
                    expect.anything(),
                    { 'checksum': true, 'sandbox': false }
                );
            });

            it('should return the new doi', () => {
                expect(result).toEqual({
                    id: 'someid',
                    doi: 'somedoi',
                    html: 'somehtmlurl'
                });
            });

            it('should publish notification', () => {
                expect(notifyPublish2Zenodo).toHaveBeenCalledWith('somehtmlurl');
            });
        });

    });
});
