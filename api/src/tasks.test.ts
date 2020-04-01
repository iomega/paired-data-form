import { enrichAllProjects } from './tasks';
import { ProjectDocumentStore } from './projectdocumentstore';
import { loadJSONDocument } from './util/io';
import { EXAMPLE_PROJECT_JSON_FN } from './testhelpers';
import { EnrichedProjectDocument } from './store/enrichments';
import { enrich } from './enrich';

jest.mock('./enrich');

describe('enrichAllProjects()', () => {
    let enrichment_store: any;
    let store: any;
    let project: EnrichedProjectDocument;
    let pproject: EnrichedProjectDocument;

    beforeAll(async () => {
        (enrich as jest.Mock).mockImplementation(() => {
            return 'MockedEnrichments';
        });
        enrichment_store = {
            set: jest.fn()
        };
        project = {
            _id: 'projectid1.1',
            project: await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN)
        };
        pproject = {
            _id: 'projectid2.1',
            project: await loadJSONDocument(EXAMPLE_PROJECT_JSON_FN)
        };
        store = {
            listProjects: async () => {
                return [project];
            },
            listPendingProjects: async () => {
                return [pproject];
            },
            enrichment_store
        };
        await enrichAllProjects(store as ProjectDocumentStore);
    });

    it('should store enrichments of approved project', () => {
        expect(enrichment_store.set).toBeCalledWith('projectid1.1', 'MockedEnrichments');
    });

    it('should store enrichments of pending project', () => {
        expect(enrichment_store.set).toBeCalledWith('projectid2.1', 'MockedEnrichments');
    });
});