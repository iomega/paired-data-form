import { Request, Response } from 'express';

import { Db, NotFoundException } from './db';
import { Validator } from './validate';

function getDb(req: Request) {
    return req.app.get('db') as Db;
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
    const db = getDb(req);
    const project_id = await db.createProject(project);
    const location = req.baseUrl + '/api/pending/projects/' + project_id;
    res.set('Location', location);
    res.status(201);
    res.json({'message': 'Created pending project', location});
}

export function listPendingProjects(req: Request, res: Response) {
    const db = getDb(req);
    res.json(db.listPendingProjects());
}

export function getPendingProject(req: Request, res: Response) {
    const db = getDb(req);
    const project_id = req.params.id;
    const project = db.getPendingProject(project_id);
    res.json(project);
}

export async function approveProject(req: Request, res: Response) {
    const db = getDb(req);
    const project_id = req.params.id;
    await db.approveProject(project_id);
    const location = req.baseUrl + '/api/projects/' + project_id;
    res.set('Location', location);
    res.status(200);
    res.json({'message': 'Approved pending project', location});
}

export async function denyProject(req: Request, res: Response) {
    const db = getDb(req);
    const project_id = req.params.id;
    await db.denyProject(project_id);
    res.status(200);
    res.json({'message': 'Denied pending project'});
}

export function listProjects(req: Request, res: Response) {
    const db = getDb(req);
    res.json(db.listProjects());
}

export function getProject(req: Request, res: Response) {
    const db = getDb(req);
    const project_id = req.params.id;
    const project = db.getProject(project_id);
    res.json(project);
}

export async function getProjectHistory(req: Request, res: Response) {
    const db = getDb(req);
    const project_id = req.params.id;
    const history = await db.projectHistory(project_id);
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
    const db = getDb(req);
    const project_id = req.params.id;
    const new_project_id = await db.editProject(project_id, project);
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