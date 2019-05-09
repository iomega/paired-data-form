import fs from 'fs';
import os from 'os';
import path from 'path';

import rimraf from 'rimraf';

import { Db } from './db';

describe('Db', () => {
    let datadir: string;
    let db: Db;
    beforeEach(() => {
        datadir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdp'));
        db = new Db(datadir);
    });

    afterEach(() => {
        rimraf.sync(datadir);
    });

    describe('empty database', () => {
        it('should have zero approved documents', () => {
            const entries: [string, object][] = [];
            const expected = {entries};
            expect(db.listProjects()).toEqual(expected);
        });

        it('should have zero pending documents', () => {
            const entries: [string, object][] = [];
            const expected = {entries};
            expect(db.listPendingProjects()).toEqual(expected);
        });
    });
});