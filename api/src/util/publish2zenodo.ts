import fetch from 'node-fetch';
import FormData from 'form-data';
import archiver, { Archiver } from 'archiver';

import { ProjectDocumentStore } from '../projectdocumentstore';

export async function publish2zenodo(store: ProjectDocumentStore, access_token: string, deposition_id: number, api_base_url = 'https://zenodo.org/api') {
    const archive = await create_archive(store);
    const versioned_deposition_url = await create_new_version(access_token, deposition_id, api_base_url);
    await upload_file(versioned_deposition_url, access_token, archive);
    await update_new_version(versioned_deposition_url, access_token);
    return await publish_deposition(versioned_deposition_url, access_token);
}

export async function create_archive(store: ProjectDocumentStore) {
    const archive = archiver('zip');
    const projects = await store.listProjects();
    projects.forEach((p) => {
        const name = `${p._id}.json`;
        const body = JSON.stringify(p.project, undefined, 4);
        archive.append(body, {name});
    });
    await archive.finalize();
    return archive;
}

export function current_version() {
    return new Date().toISOString().substr(0, 10) + 'dev1';
}

function auth_headers(access_token: string) {
    return {
        'Authorization': `Bearer ${access_token}`
    };
}

async function create_new_version(access_token: string, deposition_id: number, api_base_url: string) {
    const url = api_base_url + `/deposit/depositions/${deposition_id}/actions/newversion`;
    console.log(url);
    const init = {
        method: 'POST',
        headers: auth_headers(access_token)
    };
    const response = await fetch(url, init);
    if (response.ok) {
        const body = await response.json();
        console.log(body);
        return body.links.latest_draft;
    } else {
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}

async function upload_file(deposition_url: string, access_token: string, archive: Archiver) {
    const url = `${deposition_url}/files`;
    console.log(url);
    const body = new FormData();
    body.append('name', 'database.zip');
    body.append('file', archive as any);
    const init = {
        method: 'POST',
        headers: {
            ...auth_headers(access_token),
            'Content-Type': 'multipart/form-data'
        },
        body
    };
    const response = await fetch(url, init as any);
    if (response.ok) {
        const body = await response.json();
        console.log(body);
        return body.id;
    } else {
        console.log(await response.text());
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}

async function update_new_version(deposition_url: string, access_token: string) {
    const url = deposition_url;
    console.log(url);
    const version = current_version();
    const body = JSON.stringify({
        metadata: {
            version
        }
    });
    const init = {
        method: 'PUT',
        headers: {
            ...auth_headers(access_token),
            'Content-Type': 'application/json'
        },
        body
    };
    const response = await fetch(url, init as any);
    console.log(body);
    if (!response.ok) {
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}

async function publish_deposition(deposition_url: string, access_token: string) {
    const url = deposition_url + '/actions/publish';
    console.log(url);
    const init = {
        method: 'POST',
        headers: auth_headers(access_token),
    };
    const response = await fetch(url, init as any);
    if (response.ok) {
        const body = await response.json();
        console.log(body);
        return body.links.doi;
    } else {
        throw new Error(`Zenodo API communication error: ${response.statusText}`);
    }
}