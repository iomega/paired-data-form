
export class Db {
    pending: object[];
    approved: object[];

    constructor(private datadir: string) {
        this.readApprovedProjects();
        this.readPendingProjects();
    }

    readApprovedProjects() {
        // TODO implement
    }

    readPendingProjects() {
        // TODO implement
    }

    createProject(project: object) {
        const project_id = 'someid';  // TODO generate id
        return project_id;
    }

    editProject(project: object) {
        // TODO archive old project
        // TODO put new project in pending
        // TODO return new project id
    }

    listProjects() {
        return this.approved;
    }

    getProject(project_id: string) {
        // TODO implement
    }

    listPendingProjects() {
        return this.pending;
    }

    getPendingProject(project_id: string) {
        // TODO implement
    }

    denyProject(project_id: string) {
        // TODO implement
    }

    approveProject(project_id: string) {
        // TODO implement
    }

    projectHistory(project_id: string) {
        // TODO implement
    }
}