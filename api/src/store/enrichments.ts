import Keyv from 'keyv';

import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from '../schema';
import { ProjectEnrichments } from '../enrich';

const PREFIX = 'enrichment:';

export interface EnrichedProjectDocument {
    _id: string;
    project: ProjectDocument;
    enrichments?: ProjectEnrichments;
}

export class ProjectEnrichmentStore {
    store: Keyv<ProjectEnrichments>;

    constructor(private redis_url: string) {
        this.store = new Keyv<ProjectEnrichments>(redis_url);
        this.store.on('error', err => console.log('Connection Error', err));
    }

    async set(project_id: string, enrichment: ProjectEnrichments) {
        await this.store.set(PREFIX + project_id, enrichment);
    }

    async get(project_id: string) {
        return await this.store.get(PREFIX + project_id);
    }

    async delete(project_id: string) {
        await this.store.delete(PREFIX + project_id);
    }

    async merge(project_id: string, project: ProjectDocument): Promise<EnrichedProjectDocument> {
        try {
            const enrichments = await this.get(project_id);
            if (!enrichments) {
                console.log('Enrichment not found for ' + project_id);
                return {
                    _id: project_id,
                    project: project
                };
            }
            return {
                _id: project_id,
                project: project,
                enrichments
            };
        } catch (err) {
            console.log('Error retrieving enrichment for ' + project_id, err);
            return {
                _id: project_id,
                project: project
            };
        }
    }

    async mergeMany(entries: [string, ProjectDocument][]): Promise<EnrichedProjectDocument[]> {
        const data = [];
        for (const entry of entries) {
            data.push(await this.merge(entry[0], entry[1]));
        }
        return data;
    }
}
