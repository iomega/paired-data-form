import fs from 'fs';
import path from 'path';
import uuid from 'uuid/v4';

import logger from './util/logger';
import { loadJSONDocument, mkdirDirOptional } from './util/io';
import { IOMEGAPairedDataPlatform } from './schema';
import { parseProjectFilename, bumpRevision, parseProjectId, unbumpRevision, toAccession } from './util/id';

export class NotFoundException extends Error {
}

export class ProjectDocumentStore {
    pending: Map<string, IOMEGAPairedDataPlatform> = new Map();
    approved: Map<string, IOMEGAPairedDataPlatform> = new Map();
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

    private async readApprovedProjects() {
        logger.info('Reading approved projects from ' + this.approvedDir);
        const files = await fs.promises.readdir(this.approvedDir);
        for (const fn of files.filter(fn => fn.endsWith('.json')).sort()) {
            const afn = path.join(this.approvedDir, fn);
            const project_id = parseProjectFilename(fn);
            const project = await loadJSONDocument(afn);
            this.approved.set(project_id, project);
        }
        logger.info(this.approved.size + ' approved projects found');
    }

    private async readPendingProjects() {
        logger.info('Reading pending projects from ' + this.pendingDir);
        const files = await fs.promises.readdir(this.pendingDir);
        for (const fn of files.filter(fn => fn.endsWith('.json')).sort()) {
            const afn = path.join(this.pendingDir, fn);
            const project_id = parseProjectFilename(fn);
            const project = await loadJSONDocument(afn);
            this.pending.set(project_id, project);
        }
        logger.info(this.pending.size + ' pending projects found');
    }

    private async writePendingProject(project: object, fn: string) {
        await fs.promises.writeFile(
            path.join(this.pendingDir, fn),
            JSON.stringify(project, undefined, 4)
        );
    }

    private async archiveProject(project_id: string) {
        // Move in memory
        this.approved.delete(project_id);
        // Move file on disk
        const fn = project_id + '.json';
        await fs.promises.rename(
            path.join(this.approvedDir, fn),
            path.join(this.archiveDir, fn)
        );
    }

    async intialize() {
        await this.initDatadir();
        await Promise.all([
            this.readApprovedProjects(),
            this.readPendingProjects()
        ]);
    }

    async createProject(project: IOMEGAPairedDataPlatform, accession = uuid()) {
        const project_id = accession + '.1';
        this.pending.set(project_id, project);
        const fn = project_id + '.json';
        await this.writePendingProject(project, fn);
        return project_id;
    }


    async editProject(old_project_id: string, project: IOMEGAPairedDataPlatform) {
        this.getProject(old_project_id); // Check project exists
        const new_project_id = bumpRevision(old_project_id);
        this.pending.set(new_project_id, project);
        const fn = new_project_id + '.json';
        await this.writePendingProject(project, fn);
        return new_project_id;
    }

    listProjects() {
        const entries = Array.from(this.approved.entries());
        return { entries };
    }

    getProject(project_id: string) {
        const project = this.approved.get(project_id);
        if (!project) {
            throw new NotFoundException('Not found ' + project_id);
        }
        return project;
    }

    listPendingProjects() {
        const entries = Array.from(this.pending.entries());
        return { entries };
    }

    getPendingProject(project_id: string) {
        const project = this.pending.get(project_id);
        if (!project) {
            throw new NotFoundException('Not found ' + project_id);
        }
        return project;
    }

    async denyProject(project_id: string) {
        this.getPendingProject(project_id);
        this.pending.delete(project_id);
        const fn = project_id + '.json';
        await fs.promises.unlink(path.join(this.pendingDir, fn));
    }

    async approveProject(project_id: string) {
        const project = this.getPendingProject(project_id);
        // Move in memory
        this.approved.set(project_id, project);
        this.pending.delete(project_id);
        const pid = parseProjectId(project_id);
        if (pid.revision > 1) {
            // Archive old approved version of project
            // TODO find approved revision of project instead of -1
            const approved_project_id = unbumpRevision(project_id);
            this.archiveProject(approved_project_id);
        }
        // Move file on disk
        const fn = project_id + '.json';
        await fs.promises.rename(
            path.join(this.pendingDir, fn),
            path.join(this.approvedDir, fn)
        );
    }

    async projectHistory(project_id: string) {
        const current = this.getProject(project_id);
        const project_accession = toAccession(project_id);
        logger.info('Reading history of ' + project_accession + 'project from ' + this.archiveDir);
        const files = await fs.promises.readdir(this.archiveDir);
        const checkFilename = (fn: string) => fn.startsWith(project_accession + '.') && fn.endsWith('.json');
        const loadProject = async (fn: string) => {
            const afn = path.join(this.archiveDir, fn);
            const project_id = parseProjectFilename(fn);
            const project = await loadJSONDocument(afn);
            return [project_id, project];
        };
        const archived = await Promise.all(files.filter(checkFilename).sort().map(loadProject));
        logger.info(archived.length + ' old revisions of project found');
        return {
            current,
            archived
        };
    }
}