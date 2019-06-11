import uuid from 'uuid/v4';

interface ProjectId {
    accession: string;
    revision: number;
}

export function parseProjectId(project_id: string): ProjectId {
    const parts = project_id.split('.');
    return {
        accession: parts[0],
        revision: Number.parseInt(parts[1])
    };
}

export function parseProjectFilename(fn: string) {
    return fn.replace('.json', '');
}

function dumpProjectId(id: ProjectId) {
    return id.accession + '.' + id.revision;
}

export function bumpRevision(old: string) {
    const id = parseProjectId(old);
    id.revision += 1;
    return dumpProjectId(id);
}

export function unbumpRevision(old: string) {
    const id = parseProjectId(old);
    id.revision -= 1;
    return dumpProjectId(id);
}

export function toAccession(project_id: string) {
    return parseProjectId(project_id).accession;
}

export function generateId(accession = uuid(), revision = '1') {
    return accession + '.' + revision;
}