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
    enrichqueue.on('error', (e) => console.log(e));
    enrichqueue.on('failed', (e) => console.log(e));
    return enrichqueue;
}

export const enrichProject = async (store: ProjectEnrichmentStore, project_id: string, project: ProjectDocument) => {
    const enrichments = await enrich(project);
    store.set(project_id, enrichments);
};

export async function enrichAllProjects(store: ProjectDocumentStore) {
    console.log('Finding approved projects without enrichments');
    const projects = (await store.listProjects()).filter(p => !p.enrichments);
    console.log(`Found ${projects.length} projects without enrichments`);
    for (const project of projects) {
        console.log(`Enriching ${project._id}`);
        await enrichProject(store.enrichment_store, project._id, project.project);
        console.log(`Enriched ${project._id}`);
    }

    console.log('Finding pending projects without enrichments');
    const pending_projects = (await store.listPendingProjects()).filter(p => !p.enrichments);
    console.log(`Found ${projects.length} projects without enrichments`);
    for (const project of pending_projects) {
        console.log(`Enriching ${project._id}`);
        await enrichProject(store.enrichment_store, project._id, project.project);
        console.log(`Enriched ${project._id}`);
    }
}