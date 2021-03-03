import path from 'path';
import fs from 'fs';

import { loadJSONDocument, mkdirDirOptional } from '../util/io';
import { parseProjectFilename, toAccession } from '../util/id';
import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from '../schema';

const loadProject = (directory: string) => {
    return async (fn: string) => {
        const afn = path.join(directory, fn);
        const project_id = parseProjectFilename(fn);
        const project = await loadJSONDocument(afn);
        return [project_id, project] as [string, ProjectDocument];
    };
};

async function readProjects(directory: string) {
    const files = await fs.promises.readdir(directory);
    const projects = files.map(loadProject(directory));
    return Promise.all(projects);
}

export class ProjectDocumentDiskStore {
    pendingDir: string;
    approvedDir: string;
    archiveDir: string;
    thrashDir: string;

    constructor(private datadir: string) {
        this.pendingDir = path.join(datadir, 'pending');
        this.approvedDir = path.join(datadir, 'approved');
        this.archiveDir = path.join(datadir, 'archive');
        this.thrashDir = path.join(datadir, 'thrash');
    }

    private async initDatadir() {
        await mkdirDirOptional(this.datadir);
        await mkdirDirOptional(this.pendingDir);
        await mkdirDirOptional(this.approvedDir);
        await mkdirDirOptional(this.archiveDir);
        await mkdirDirOptional(this.thrashDir);
    }

    async writePendingProject(project_id: string, project: object) {
        const fn = project_id + '.json';
        await fs.promises.writeFile(
            path.join(this.pendingDir, fn),
            JSON.stringify(project, undefined, 4)
        );
    }

    public async archiveProject(project_id: string) {
        const fn = project_id + '.json';
        await fs.promises.rename(
            path.join(this.approvedDir, fn),
            path.join(this.archiveDir, fn)
        );
    }

    async intialize() {
        await this.initDatadir();
    }

    async denyProject(project_id: string) {
        const fn = project_id + '.json';
        await fs.promises.rename(
            path.join(this.pendingDir, fn),
            path.join(this.thrashDir, fn)
        );
    }

    async approveProject(project_id: string) {
        const fn = project_id + '.json';
        await fs.promises.rename(
            path.join(this.pendingDir, fn),
            path.join(this.approvedDir, fn)
        );
    }

    async archivedVersions(project_id: string) {
        const project_accession = toAccession(project_id);
        const files = await fs.promises.readdir(this.archiveDir);
        const checkFilename = (fn: string) => fn.startsWith(project_accession + '.') && fn.endsWith('.json');
        return Promise.all(files.filter(checkFilename).sort().reverse().map(loadProject(this.archiveDir)));
    }

    async readApprovedProjects() {
        return readProjects(this.approvedDir);
    }

    async readPendingProjects() {
        return readProjects(this.pendingDir);
    }

    async projectStats(project_id: string) {
        const fn = path.join(this.approvedDir, project_id + '.json');
        return fs.promises.stat(fn);
    }

    async health() {
        try {
            const fn = path.join(this.datadir, 'health.check');
            await fs.promises.writeFile(
                fn,
                'test if data dir is writable'
            );
            await fs.promises.unlink(fn);
            return true;
        } catch (e) {
            console.error('disk health failure: ', e);
            return false;
        }
    }
}
