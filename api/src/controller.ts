import { Request, Response } from 'express';

import { ProjectDocumentStore, NotFoundException } from './projectdocumentstore';
import { Validator } from './validate';
import { Queue } from 'bull';
import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from './schema';
import { computeStats } from './util/stats';
import { summarizeProject } from './summarize';
import { ZENODO_DEPOSITION_ID } from './util/secrets';
import { FilterFields, DEFAULT_PAGE_SIZE, Order, SearchOptions, SortFields } from './store/search';


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

function checkRange(svalue: string, label: string, min: number, max: number) {
    const value = parseInt(svalue);
    if (Number.isNaN(value)) {
        throw `${label} is not an integer`;
    }
    if (value < min || value > max ) {
        throw `${label} must be between \`${min}\` and \`${max}\``;
    }
    return value;
}

function validateSearchOptions(query: any) {
    const options: SearchOptions = {};

    if (query.q) {
        options.query = query.q;
    }
    if (query.fk || query.fv) {
        if (query.fk && query.fv) {
            if (query.q) {
                throw 'Either search with `q` or filter with `fk` and `fv`';
            }
            if (!(query.fk in FilterFields)) {
                throw 'Invalid `fk`';
            }
            options.filter = {
                key: query.fk,
                value: query.fv
            };
        } else {
            throw 'Require both `fk` and `fv` to filter';
        }
    }
    if (query.size) {
        options.size = checkRange(query.size, 'Size', 1, 1000);
    } else {
        options.size = DEFAULT_PAGE_SIZE;
    }
    if (query.page) {
        options.from = checkRange(query.page, 'Page', 0, 1000) * options.size;
    } else {
        options.from = 0;
    }
    if (query.sort) {
        if (!(query.sort in SortFields)) {
            throw 'Invalid `sort`';
        }
        options.sort = query.sort;
    }
    if (query.order) {
        if (!(query.order in Order)) {
            throw 'Invalid `order`, must be either `desc` or `asc`';
        }
        options.order = Order[query.order as 'desc' | 'asc'];
    }
    return options;
}

export async function listProjects(req: Request, res: Response) {
    const store = getStore(req);
    try {
        const options = validateSearchOptions(req.query);
        const hits = await store.searchProjects(options);
        res.json(hits);
    } catch (message) {
        res.status(400);
        res.json({message});
    }
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