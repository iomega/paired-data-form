import fs from 'fs';
import os from 'os';
import path from 'path';

import rimraf from 'rimraf';

import { ProjectDocumentStore } from './projectdocumentstore';
import { EnrichedProjectDocument } from './store/enrichments';

describe('ProjectDocumentStore', () => {
    let datadir: string;
    let store: ProjectDocumentStore;
    beforeEach(() => {
        datadir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdp'));
        store = new ProjectDocumentStore(datadir, undefined);
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
    });
});