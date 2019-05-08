import fs from 'fs';
import path from 'path';
import uuid from 'uuid/v4';

import logger from './util/logger';
import { loadJSONDocument } from './util/io';

class NotFoundException extends Error {
}

interface ProjectId {
    accession: string;
    revision: number;
}

function parseProjectId(project_id: string): ProjectId {
    const parts = project_id.split('.');
    return {
        accession: parts[0],
        revision: Number.parseInt(parts[1])
    };
}

function parseProjectFilename(fn: string) {
    return fn.replace('.json', '');
}

function dumpProjectId(id: ProjectId) {
    return id.accession + '.' + id.revision;
}

function bumpRevision(old: string) {
    const id = parseProjectId(old);
    id.revision += 1;
    return dumpProjectId(id);
}

function unbumpRevision(old: string) {
    const id = parseProjectId(old);
    id.revision -= 1;
    return dumpProjectId(id);
}

function toAccession(project_id: string) {
    return parseProjectId(project_id).accession;
}

export class Db {
    pending: Map<string, object> = new Map();
    approved: Map<string, object> = new Map();
    pendingDir: string;
    approvedDir: string;
    archiveDir: string;

    constructor(private datadir: string) {
        this.pendingDir = path.join(datadir, 'pending');
        this.approvedDir = path.join(datadir, 'approved');
        this.archiveDir = path.join(datadir, 'archive');
        this.initDatadir();
        this.readApprovedProjects();
        this.readPendingProjects();
    }

    private initDatadir() {
        const dirs = [
            this.datadir,
            this.pendingDir,
            this.approvedDir,
            this.archiveDir
        ];
        const mode = fs.constants.W_OK;
        dirs.forEach((dir) => {
            try {
                fs.accessSync(dir, mode);
            } catch {
                fs.mkdirSync(dir);
            }
        });
    }

    private readApprovedProjects() {
        logger.info('Reading approved projects from ' + this.approvedDir);
        fs.readdirSync(this.approvedDir)
            .filter(fn => fn.endsWith('.json'))
            .sort()
            .forEach(fn => {
                const afn = path.join(this.approvedDir, fn);
                const project_id = parseProjectFilename(fn);
                const project = loadJSONDocument(afn);
                this.approved.set(project_id, project);
            })
        ;
        logger.info(this.approved.size + ' approved projects found');
    }

    private readPendingProjects() {
        logger.info('Reading pending projects from ' + this.pendingDir);
        fs.readdirSync(this.pendingDir)
            .filter(fn => fn.endsWith('.json'))
            .sort()
            .forEach(fn => {
                const afn = path.join(this.pendingDir, fn);
                const project_id = parseProjectFilename(fn);
                const project = loadJSONDocument(afn);
                this.pending.set(project_id, project);
            })
        ;
        logger.info(this.pending.size + ' pending projects found');
    }

    private writePendingProject(project: object, fn: string) {
        fs.writeFileSync(
            path.join(this.pendingDir, fn),
            JSON.stringify(project, undefined, 4)
        );
    }

    private archiveProject(project_id: string) {
        // Move in memory
        this.approved.delete(project_id);
        // Move file on disk
        const fn = project_id + '.json';
        fs.renameSync(
            path.join(this.approvedDir, fn),
            path.join(this.archiveDir, fn)
        );
    }

    createProject(project: object) {
        const project_id = uuid() + '.1';
        this.pending.set(project_id, project);
        const fn = project_id + '.json';
        this.writePendingProject(project, fn);
        return project_id;
    }


    editProject(old_project_id: string, project: object) {
        this.getProject(old_project_id); // Check project exists
        const new_project_id = bumpRevision(old_project_id);
        this.pending.set(new_project_id, project);
        const fn = new_project_id + '.json';
        this.writePendingProject(project, fn);
        return new_project_id;
    }

    listProjects() {
        const entries = Array.from(this.approved.entries());
        return {entries};
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
        return {entries};
    }

    getPendingProject(project_id: string) {
        const project = this.pending.get(project_id);
        if (!project) {
            throw new NotFoundException('Not found ' + project_id);
        }
        return project;
    }

    denyProject(project_id: string) {
        this.getPendingProject(project_id);
        this.pending.delete(project_id);
        const fn = project_id + '.json';
        fs.unlinkSync(path.join(this.pendingDir, fn));
    }

    approveProject(project_id: string) {
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
        fs.renameSync(
            path.join(this.pendingDir, fn),
            path.join(this.approvedDir, fn)
        );
    }

    projectHistory(project_id: string) {
        const current = this.getProject(project_id);
        const project_accession = toAccession(project_id);
        logger.info('Reading history of ' + project_accession + 'project from ' + this.archiveDir);
        const archived = fs.readdirSync(this.archiveDir)
            .filter(fn => fn.startsWith(project_accession + '.') && fn.endsWith('.json'))
            .sort()
            .map(fn => {
                const afn = path.join(this.archiveDir, fn);
                const project_id = parseProjectFilename(fn);
                const project = loadJSONDocument(afn);
                return [project_id, project];
            })
        ;
        logger.info(archived.length + ' old revisions of project found');
        return {
            current,
            archived
        };
    }
}