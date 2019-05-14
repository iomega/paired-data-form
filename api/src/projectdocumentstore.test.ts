import fs from 'fs';
import os from 'os';
import path from 'path';

import rimraf from 'rimraf';

import { ProjectDocumentStore } from './projectdocumentstore';

describe('ProjectDocumentStore', () => {
    let datadir: string;
    let store: ProjectDocumentStore;
    beforeEach(() => {
        datadir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdp'));
        store = new ProjectDocumentStore(datadir);
    });

    afterEach(() => {
        rimraf.sync(datadir);
    });

    describe('empty database', () => {
        it('should have zero approved documents', () => {
            const entries: [string, object][] = [];
            const expected = {entries};
            expect(store.listProjects()).toEqual(expected);
        });

        it('should have zero pending documents', () => {
            const entries: [string, object][] = [];
            const expected = {entries};
            expect(store.listPendingProjects()).toEqual(expected);
        });
    });
});