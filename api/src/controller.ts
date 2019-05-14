import { Request, Response } from 'express';

import { ProjectDocumentStore, NotFoundException } from './projectdocumentstore';
import { Validator } from './validate';

function getStore(req: Request) {
    return req.app.get('store') as ProjectDocumentStore;
}

function getValidator(req: Request) {
    return req.app.get('validator') as Validator;
}

export async function createProject(req: Request, res: Response) {
    const project = req.body;
    const validator = getValidator(req);
    if (!validator.validate(project)) {
        res.status(500);
        res.json(validator.errors);
        return;
    }
    const store = getStore(req);
    const project_id = await store.createProject(project);
    const location = req.baseUrl + '/api/pending/projects/' + project_id;
    res.set('Location', location);
    res.status(201);
    res.json({'message': 'Created pending project', location});
}

export function listPendingProjects(req: Request, res: Response) {
    const store = getStore(req);
    res.json(store.listPendingProjects());
}

export function getPendingProject(req: Request, res: Response) {
    const store = getStore(req);
    const project_id = req.params.id;
    const project = store.getPendingProject(project_id);
    res.json(project);
}

export async function approveProject(req: Request, res: Response) {
    const store = getStore(req);
    const project_id = req.params.id;
    // Approve project
    await store.approveProject(project_id);
    const location = req.baseUrl + '/api/projects/' + project_id;
    res.set('Location', location);
    res.status(200);
    res.json({'message': 'Approved pending project', location});
}

export async function denyProject(req: Request, res: Response) {
    const store = getStore(req);
    const project_id = req.params.id;
    await store.denyProject(project_id);
    res.status(200);
    res.json({'message': 'Denied pending project'});
}

export function listProjects(req: Request, res: Response) {
    const store = getStore(req);
    res.json(store.listProjects());
}

export function getProject(req: Request, res: Response) {
    const store = getStore(req);
    const project_id = req.params.id;
    const project = store.getProject(project_id);
    res.json(project);
}

export async function getProjectHistory(req: Request, res: Response) {
    const store = getStore(req);
    const project_id = req.params.id;
    const history = await store.projectHistory(project_id);
    res.json(history);
}

export async function editProject(req: Request, res: Response) {
    const project = req.body;
    const validator = getValidator(req);
    if (!validator.validate(project)) {
        res.status(500);
        res.json(validator.errors);
        return;
    }
    const store = getStore(req);
    const project_id = req.params.id;
    const new_project_id = await store.editProject(project_id, project);
    const location = req.baseUrl + '/api/pending/projects/' + new_project_id;
    res.set('Location', location);
    res.status(201);
    res.json({'message': 'Created pending project', location});
}

export function notFoundHandler(error: any, req: Request, res: Response, next: any) {
    if (error instanceof NotFoundException) {
        res.status(404);
        const message = error.message;
        res.json({message});
    }
    next(error);
}