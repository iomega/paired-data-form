import { bumpRevision, generateId } from './util/id';
import { ProjectDocumentMemoryStore, NotFoundException as MemoryNotFoundException } from './store/Memory';
import { ProjectDocumentDiskStore } from './store/Disk';
import { IOMEGAPairedDataPlatform as ProjectDocument } from './schema';
import logger from './util/logger';

export const NotFoundException = MemoryNotFoundException;

export class ProjectDocumentStore {
    memory_store = new ProjectDocumentMemoryStore();
    disk_store: ProjectDocumentDiskStore;

    constructor(datadir: string) {
        this.disk_store = new ProjectDocumentDiskStore(datadir);
    }

    async initialize() {
        await this.disk_store.intialize();
        this.memory_store.initialize(
            await this.disk_store.readApprovedProjects(),
            await this.disk_store.readPendingProjects()
        );
    }

    async createProject(project: ProjectDocument, project_id = generateId()) {
        this.memory_store.addPendingProject(project_id, project);
        await this.disk_store.writePendingProject(project_id, project);
        return project_id;
    }


    async editProject(old_project_id: string, project: ProjectDocument) {
        this.getProject(old_project_id); // Check project exists
        const new_project_id = bumpRevision(old_project_id);
        await this.disk_store.writePendingProject(new_project_id, project);
        this.memory_store.editProject(new_project_id, project);
        return new_project_id;
    }

    listProjects() {
        const entries = this.memory_store.listProjects();
        return { entries };
    }

    getProject(project_id: string) {
        return this.memory_store.getProject(project_id);
    }

    listPendingProjects() {
        const entries = this.memory_store.listPendingProjects();
        return { entries };
    }

    getPendingProject(project_id: string) {
        return this.memory_store.getPendingProject(project_id);
    }

    async denyProject(project_id: string) {
        await this.disk_store.denyProject(project_id);
        this.memory_store.denyProject(project_id);
    }

    async approveProject(project_id: string) {
        await this.archivePreviousProject(project_id);
        this.memory_store.approveProject(project_id);
        await this.disk_store.approveProject(project_id);
    }

    private async archivePreviousProject(project_id: string) {
        const prev_project_id = this.memory_store.getPreviousProject(project_id);
        if (prev_project_id) {
            this.memory_store.deleteApproved(prev_project_id);
            await this.disk_store.archiveProject(prev_project_id);
        }
    }

    async projectHistory(project_id: string) {
        const current = this.getProject(project_id);
        const archived = await this.disk_store.archivedVersions(project_id);
        logger.info(archived.length + ' old revisions of project found');
        return {
            current,
            archived
        };
    }
}