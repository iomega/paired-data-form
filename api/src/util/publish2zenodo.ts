import fs from 'fs';
import fetch from 'node-fetch';
import archiver from 'archiver';
import { withFile } from 'tmp-promise';

import { ProjectDocumentStore } from '../projectdocumentstore';

export async function publish2zenodo(store: ProjectDocumentStore, access_token: string, deposition_id: number, api_base_url = 'https://zenodo.org/api') {
    const versioned_deposition_url = await create_new_version(access_token, deposition_id, api_base_url);
    const {metadata, bucket_url} = await get_versioned_deposition(versioned_deposition_url, access_token);
    await withFile(async ({path}) => {
        await create_archive(store, path);
        await upload_file(bucket_url, access_token, path);
    });
    await update_new_version(versioned_deposition_url, metadata, access_token);
    return await publish_deposition(versioned_deposition_url, access_token);
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
    return new Date().toISOString().substr(0, 10) + 'dev2';
}

function auth_headers(access_token: string) {
    return {
        'Authorization': `Bearer ${access_token}`
    };
}

export async function create_new_version(access_token: string, deposition_id: number, api_base_url: string) {
    const url = api_base_url + `/deposit/depositions/${deposition_id}/actions/newversion`;
    const init = {
        method: 'POST',
        headers: auth_headers(access_token)
    };
    const response = await fetch(url, init);
    if (response.ok) {
        const body = await response.json();
        return body.links.latest_draft;
    } else {
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}

export async function get_versioned_deposition(deposition_url: string, access_token: string) {
    const init = {
        method: 'GET',
        headers: auth_headers(access_token)
    };
    const response = await fetch(deposition_url, init);
    if (response.ok) {
        const body = await response.json();
        return {
            bucket_url: body.links.bucket,
            metadata: body.metadata
        };
    } else {
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}

export async function upload_file(bucket_url: string, access_token: string, filepath: string, filename= 'database.zip') {
    const url = `${bucket_url}/${filename}`;

    const body = fs.createReadStream(filepath);
    const stat = await fs.promises.stat(filepath);

    const init = {
        method: 'PUT',
        headers: {
            ...auth_headers(access_token),
            'Content-Type': 'application/zip',
            'Content-Length': stat.size
        },
        body
    };
    const response = await fetch(url, init as any);
    if (response.ok) {
        const rbody = await response.json();
        return rbody.id;
    } else {
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}

export async function update_new_version(deposition_url: string, metadata: any, access_token: string) {
    const url = deposition_url;
    const version = current_version();
    metadata.version = version;
    const body = JSON.stringify({metadata});
    const init = {
        method: 'PUT',
        headers: {
            ...auth_headers(access_token),
            'Content-Type': 'application/json'
        },
        body
    };
    const response = await fetch(url, init as any);
    if (!response.ok) {
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}

async function publish_deposition(deposition_url: string, access_token: string) {
    const url = deposition_url + '/actions/publish';
    const init = {
        method: 'POST',
        headers: auth_headers(access_token),
    };
    const response = await fetch(url, init as any);
    if (response.ok) {
        const body = await response.json();
        return body.links.doi;
    } else {
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}