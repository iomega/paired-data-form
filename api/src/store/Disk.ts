import path from 'path';
import fs from 'fs';


import logger from '../util/logger';
import { loadJSONDocument, mkdirDirOptional } from '../util/io';
import { parseProjectFilename, toAccession } from '../util/id';
import { IOMEGAPairedDataPlatform as ProjectDocument } from '../schema';

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
    return await Promise.all(projects);
}

export class ProjectDocumentDiskStore {
    pendingDir: string;
    approvedDir: string;
    archiveDir: string;

    constructor(private datadir: string) {
        this.pendingDir = path.join(datadir, 'pending');
        this.approvedDir = path.join(datadir, 'approved');
        this.archiveDir = path.join(datadir, 'archive');
    }

    private async initDatadir() {
        await mkdirDirOptional(this.datadir);
        await mkdirDirOptional(this.pendingDir);
        await mkdirDirOptional(this.approvedDir);
        await mkdirDirOptional(this.archiveDir);
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
        await fs.promises.unlink(path.join(this.pendingDir, fn));
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
        logger.info('Reading history of ' + project_accession + 'project from ' + this.archiveDir);
        const files = await fs.promises.readdir(this.archiveDir);
        const checkFilename = (fn: string) => fn.startsWith(project_accession + '.') && fn.endsWith('.json');
        return await Promise.all(files.filter(checkFilename).sort().map(loadProject(this.archiveDir)));
    }

    async readApprovedProjects() {
        return await readProjects(this.approvedDir);
    }

    async readPendingProjects() {
        return await readProjects(this.pendingDir);
    }
}