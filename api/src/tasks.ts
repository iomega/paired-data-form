import Bull from 'bull';
import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from './schema';
import { REDIS_URL, ZENODO_DEPOSITION_ID, ZENODO_ACCESS_TOKEN } from './util/secrets';
import { enrich } from './enrich';
import { ProjectDocumentStore } from './projectdocumentstore';
import { publish2zenodo } from './util/publish2zenodo';
import { DraftDiscardedError } from '@iomeg/zenodo-upload';
import { notifyPublish2Zenodo } from './util/notify';

export function buildEnrichQueue(store: ProjectDocumentStore) {
    const queue = new Bull<[string, ProjectDocument]>('enrichqueue', REDIS_URL);
    queue.process(async (job) => {
        return await enrichProject(store, job.data[0], job.data[1]);
    });
    queue.on('error', (e) => console.log('bull error', e));
    queue.on('failed', (e) => console.log('bull failed', e));
    queue.on('stalled', (e) => console.log('bull stalled', e));
    return queue;
}

export const enrichProject = async (store: ProjectDocumentStore, project_id: string, project: ProjectDocument) => {
    console.log('Enriching project ' + project_id);
    const enrichments = await enrich(project);
    await store.addEnrichments(project_id, enrichments);
    console.log('Enriched project ' + project_id);
};

export async function enrichAllProjects(store: ProjectDocumentStore) {
    console.log('Finding approved projects without enrichments');
    const all_approved_projects = await store.listProjects();
    const projects = all_approved_projects.filter(p => !p.enrichments);
    console.log(`Found ${projects.length} approved projects without enrichments`);
    for (const project of projects) {
        await enrichProject(store, project._id, project.project);
    }

    console.log('Finding pending projects without enrichments');
    const pending_projects = (await store.listPendingProjects()).filter(p => !p.enrichments);
    console.log(`Found ${pending_projects.length} pending projects without enrichments`);
    for (const project of pending_projects) {
        await enrichProject(store, project._id, project.project);
    }
}

export function scheduledZenodoUploads(store: ProjectDocumentStore) {
    const queue = new Bull('zenodoupload', REDIS_URL);

    queue.process(async () => {
        await publish2zenodoTask(store);
    });
    queue.on('error', (e) => console.log('bull error', e));
    queue.on('failed', (e) => console.log('bull failed', e));
    queue.on('stalled', (e) => console.log('bull stalled', e));

    // At 12:00 AM, on day 1 of the month
    const cron = '0 0 1 * *';
    queue.add([], {repeat: {cron}});
}

export async function publish2zenodoTask(store: ProjectDocumentStore) {
    console.debug('Publish to Zenodo started');
    try {
        const result = await publish2zenodo(store, ZENODO_ACCESS_TOKEN, ZENODO_DEPOSITION_ID, true);
        notifyPublish2Zenodo(result.html);
        console.debug(`Publish completed: ${result.html}`);
        return result;
    } catch (error) {
        if (error instanceof DraftDiscardedError) {
            console.debug('Publish discarded, due to unchanged projects');
        }
        throw error;
    }
}
