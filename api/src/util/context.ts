import { Request } from 'express';
import { Queue } from 'bull';
import { ProjectDocumentStore } from '../projectdocumentstore';
import { Validator } from '../validate';
import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from '../schema';

export function getStore(req: Request) {
    return req.app.get('store') as ProjectDocumentStore;
}

export function getSchema(req: Request) {
    return req.app.get('schema');
}

export function getValidator(req: Request) {
    return req.app.get('validator') as Validator;
}

export function getEnrichQueue(req: Request) {
    return req.app.get('enrichqueue') as Queue<[string, ProjectDocument]>;
}

export function getPendingProjectUrl(project_id: string) {
    return 'https://pairedomicsdata.bioinformatics.nl/pending/' + project_id;
}
