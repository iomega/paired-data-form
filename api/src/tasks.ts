import Bull from 'bull';
import { IOMEGAPairedDataPlatform as ProjectDocument } from './schema';
import { REDIS_URL } from './util/secrets';
import { ProjectEnrichmentStore } from './store/enrichments';
import { enrich } from './enrich';
import { ProjectDocumentStore } from './projectdocumentstore';

export function buildEnrichQueue(store: ProjectEnrichmentStore) {
    const enrichqueue = new Bull<[string, ProjectDocument]>('enrichqueue', REDIS_URL);
    enrichqueue.process(async (job) => {
        return await enrichProject(store, job.data[0], job.data[1]);
    });
    enrichqueue
        .on('error', (e) => console.log('bull error', e))
        .on('failed', (e) => console.log('bull failed', e))
        .on('stalled', (e) => console.log('bull stalled', e))
    ;
    return enrichqueue;
}

export const enrichProject = async (store: ProjectEnrichmentStore, project_id: string, project: ProjectDocument) => {
    console.log('Enriching project ' + project_id);
    const enrichments = await enrich(project);
    await store.set(project_id, enrichments);
};

export async function enrichAllProjects(store: ProjectDocumentStore) {
    console.log('Finding approved projects without enrichments');
    const all_approved_projects = await store.listProjects();
    const projects = all_approved_projects.filter(p => !p.enrichments);
    console.log(`Found ${projects.length} approved projects without enrichments`);
    for (const project of projects) {
        await enrichProject(store.enrichment_store, project._id, project.project);
        console.log(`Enriched ${project._id}`);
    }

    console.log('Finding pending projects without enrichments');
    const pending_projects = (await store.listPendingProjects()).filter(p => !p.enrichments);
    console.log(`Found ${pending_projects.length} pending projects without enrichments`);
    for (const project of pending_projects) {
        await enrichProject(store.enrichment_store, project._id, project.project);
        console.log(`Enriched ${project._id}`);
    }
}