import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from '../schema';
import logger from '../util/logger';
import { parseProjectId } from '../util/id';

export class NotFoundException extends Error {
}

export class ProjectDocumentMemoryStore {
    pending: Map<string, ProjectDocument> = new Map();
    approved: Map<string, ProjectDocument> = new Map();

    initialize(approved: [string, ProjectDocument][], pending: [string, ProjectDocument][]) {
        this.addApprovedProjects(approved);
        this.addPendingProjects(pending);
    }

    addApprovedProject(project_id: string, project: ProjectDocument) {
        this.approved.set(project_id, project);
    }

    addPendingProject(project_id: string, project: ProjectDocument) {
        this.pending.set(project_id, project);
    }

    deleteApproved(project_id: string) {
        this.approved.delete(project_id);
    }

    editProject(new_project_id: string, project: ProjectDocument) {
        this.pending.set(new_project_id, project);
    }

    listProjects() {
        return Array.from(this.approved.entries());
    }

    getProject(project_id: string) {
        const project = this.approved.get(project_id);
        if (!project) {
            throw new NotFoundException('Not found ' + project_id);
        }
        return project;
    }

    listPendingProjects() {
        return Array.from(this.pending.entries());
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
    }

    approveProject(project_id: string) {
        const project = this.getPendingProject(project_id);
        this.approved.set(project_id, project);
        this.pending.delete(project_id);
    }

    addApprovedProjects(projects: [string, ProjectDocument][]) {
        projects.forEach((d) => {
            this.addApprovedProject(d[0], d[1]);
        });
        logger.info(this.approved.size + ' approved projects found');
    }

    addPendingProjects(projects: [string, ProjectDocument][]) {
        projects.forEach((d) => {
            this.addPendingProject(d[0], d[1]);
        });
        logger.info(this.pending.size + ' pending projects found');
    }

    getPreviousProject(query_id: string) {
        const query_pid = parseProjectId(query_id);
        for (const prev_project_id of this.approved.keys()) {
            const prev_pid = parseProjectId(prev_project_id);
            if (prev_pid.accession === query_pid.accession) {
                return prev_project_id;
            }
        }
    }
}
