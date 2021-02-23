import { Request, Response } from 'express';
import { SitemapStream } from 'sitemap';
import { createGzip } from 'zlib';

import { NotFoundException } from './projectdocumentstore';
import { computeStats } from './util/stats';
import { summarizeProject } from './summarize';
import { ZENODO_DEPOSITION_ID } from './util/secrets';
import { notifyNewProject } from './util/notify';
import { getValidator, getStore, getEnrichQueue, getPendingProjectUrl, getSchema } from './util/context';
import { validateSearchOptions } from './util/search';


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

    notifyNewProject(getPendingProjectUrl(project_id));

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

    notifyNewProject(getPendingProjectUrl(new_project_id));

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

function getApiVersion() {
    const mypackage = require('../package.json');
    return mypackage.version;
}

export function getVersionInfo(req: Request, res: Response) {
    const doi = 'https://doi.org/10.5281/zenodo.' + ZENODO_DEPOSITION_ID;
    const zenodo = 'https://zenodo.org/record/' + ZENODO_DEPOSITION_ID;
    const api = getApiVersion();
    const info = {
        api,
        dataset: {
            zenodo,
            doi,
        }
    };
    res.json(info);
}

export async function getSiteMap(req: Request, res: Response) {
    const store = getStore(req);
    const projects = await store.listProjects();

    res.header('Content-Type', 'application/xml');
    res.header('Content-Encoding', 'gzip');

    try {
        const smStream = new SitemapStream({ hostname: 'https://pairedomicsdata.bioinformatics.nl/projects/' });
        const pipeline = smStream.pipe(createGzip());

        projects.forEach(p => {
            smStream.write({
                url: p._id,
                changefreq: 'yearly',
                priority: 0.5
            });
        });
        smStream.end();

        pipeline.pipe(res).on('error', (e) => {throw e; });
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
}

export async function health(req: Request, res: Response) {
    const store = getStore(req);
    const [search_health, redis_health, disk_health ] = await Promise.all([
        store.search_engine.health(),
        store.enrichment_store.health(),
        store.disk_store.health()
    ]);
    const checks = {
        app: {
            status: 'pass' // always passes as api service is reached via reverse proxy of app
        },
        api: {
            status: 'pass' // always passes as to get here api had to be called
        },
        elasticsearch: {
            status: search_health ? 'pass' : 'fail'
        },
        redis: {
            status: redis_health === 'ready' ? 'pass' : 'fail'
        },
        disk: {
            status: disk_health ? 'pass' : 'fail'
        }
    };
    const status = Object.values(checks).every((c) => c.status === 'pass');
    const h = {
        status: status ? 'pass' : 'fail',
        version: getApiVersion(),
        checks
    };
    res.status(status ? 200 : 503);
    res.contentType('application/health+json');
    res.json(h);
}
