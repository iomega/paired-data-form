import fs from 'fs';
import { join } from 'path';

import archiver from 'archiver';
import { withDir } from 'tmp-promise';
import zenodo_upload from '@iomeg/zenodo-upload';

import { ProjectDocumentStore } from '../projectdocumentstore';

export async function publish2zenodo(store: ProjectDocumentStore, access_token: string, deposition_id: number, sandbox = false, checksum = true) {
    return await withDir(async (o) => {
        const file = join(o.path, 'database.zip');
        await create_archive(store, file);
        const version = current_version();
        return await zenodo_upload(deposition_id, file, version, access_token, {sandbox, checksum});
    }, { unsafeCleanup: true });
}

export async function create_archive(store: ProjectDocumentStore, path: string) {
    const archive = archiver('zip');
    const projects = await store.listProjects();
    projects.forEach((p) => {
        const name = `${p._id}.json`;
        const body = JSON.stringify(p.project, undefined, 4);
        archive.append(body, {name});
    });
    const wstream = fs.createWriteStream(path);

    archive.pipe(wstream);

    await archive.finalize();
    await new Promise((resolve: any, reject: any) => {
        wstream.on('finish', resolve);
        wstream.on('error', reject);
    });
    wstream.end();
}

export function current_version() {
    return new Date().toISOString().substr(0, 10);
}
