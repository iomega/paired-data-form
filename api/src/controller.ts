import { Request, Response } from 'express';

import { ProjectDocumentStore, NotFoundException, ListOptions } from './projectdocumentstore';
import { Validator } from './validate';
import { Queue } from 'bull';
import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from './schema';
import { computeStats } from './util/stats';
import { summarizeProject, compareMetaboliteID } from './summarize';
import { ZENODO_DEPOSITION_ID } from './util/secrets';


function getStore(req: Request) {
    return req.app.get('store') as ProjectDocumentStore;
}

function getSchema(req: Request) {
    return req.app.get('schema');
}

function getValidator(req: Request) {
    return req.app.get('validator') as Validator;
}

function getEnrichQueue(req: Request) {
    return req.app.get('enrichqueue') as Queue<[string, ProjectDocument]>;
}

export async function createProject(req: Request, res: Response) {
    const project = req.body;
    const validator = getValidator(req);
    if (!validator.validate(project)) {
        console.error('Project json document failed validation');
        console.error(validator.errors);
        res.status(500);
        res.json(validator.errors);
        return;
    }
    const store = getStore(req);
    const project_id = await store.createProject(project);
    const location = req.baseUrl + '/api/pending/projects/' + project_id;

    // Fire and forget enrichment job
    const queue = getEnrichQueue(req);
    queue.add([project_id, project]);

    res.set('Location', location);
    res.status(201);
    res.json({'message': 'Created pending project', location, project_id});
}

export async function listPendingProjects(req: Request, res: Response) {
    const store = getStore(req);
    const projects = await store.listPendingProjects();
    const data = projects.map(summarizeProject);
    res.json({data});
}

export async function getPendingProject(req: Request, res: Response) {
    const store = getStore(req);
    const project_id = req.params.id;
    const project = await store.getPendingProject(project_id);
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

export async function listProjects(req: Request, res: Response) {
    const store = getStore(req);
    const options: ListOptions = {};
    if (req.query.q) {
        options.query = req.query.q;
    }
    if (req.query.fk || req.query.fv) {
        if (req.query.fk && req.query.fv) {
            options.filter = {
                key: req.query.fk,
                value: req.query.fv
            };
        } else {
            res.status(400);
            res.json({ message: 'Require both `fk` and `fv` to filter'});
            return;
        }
        if (req.query.query) {
            res.status(400);
            res.json({ message: 'Eiter search with `q` or filter with `fk` and `fv`'});
            return;
        }
    }
    const projects = await store.listProjects(options);
    const data = projects.map(summarizeProject).sort(compareMetaboliteID).reverse();
    res.json({data});
}

export async function getProject(req: Request, res: Response) {
    const store = getStore(req);
    const project_id = req.params.id;
    const project = await store.getProject(project_id);
    res.json(project.project);
}

export async function getEnrichedProject(req: Request, res: Response) {
    const store = getStore(req);
    const project_id = req.params.id;
    const project = await store.getProject(project_id);
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

    // Fire and forget enrichment job
    const queue = getEnrichQueue(req);
    queue.add([new_project_id, project]);

    res.set('Location', location);
    res.status(201);
    res.json({'message': 'Created pending project', location, project_id: new_project_id});
}

export function notFoundHandler(error: any, req: Request, res: Response, next: any) {
    if (error instanceof NotFoundException) {
        res.status(404);
        const message = error.message;
        res.json({message});
    }
    next(error);
}

export async function getStats(req: Request, res: Response) {
    const store = getStore(req);
    const schema = getSchema(req);
    const projects = await store.listProjects();
    const stats = computeStats(projects, schema);
    res.json(stats);
}

export function getVersionInfo(req: Request, res: Response) {
    const doi = 'https://doi.org/10.5281/zenodo.' + ZENODO_DEPOSITION_ID;
    const zenodo = 'https://zenodo.org/record/' + ZENODO_DEPOSITION_ID;
    const mypackage = require('../package.json');
    const api = mypackage.version;
    const info = {
        api,
        dataset: {
            zenodo,
            doi,
        }
    };
    res.json(info);
}