import fetch from 'node-fetch';
import Bull from 'bull';

import { IOMEGAPairedDataPlatform as ProjectDocument } from './schema';
import { REDIS_URL } from './util/secrets';
import { ProjectEnrichmentStore } from './store/enrichments';

interface Species {
    tax_id: number;
    scientific_name: string;
}

interface GenomeEnrichment {
   url?: string;
   title?: string;
   species?: Species;
}

export interface ProjectEnrichments {
    genomes: GenomeEnrichment[];
}

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

export async function enrich(project: ProjectDocument) {
    /**
     * Retrieve, calculate enrichments for a project.
     *
     * For example will retrieve species names based on genome identifier.
     */
    const enrichment: ProjectEnrichments = {
        genomes: []
    };
    for (const genome of project.genomes) {
        enrichment.genomes.push(await enrich_genome(genome));
    }
    return enrichment;
}

async function enrich_genome(genome: any) {
    if ('GenBank_accession' in genome.genome_ID) {
        return await enrich_genbank(genome.genome_ID.GenBank_accession);
    }
    return {};
}

async function enrich_genbank(genbank_id: string) {
    return await esummary('nuccore', genbank_id);
}

async function esummary(db: string, id: string): Promise<GenomeEnrichment> {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=${db}&id=${id}&retmode=json`;
    const response = await fetch(url);
    if (response.ok) {
        const body = await response.json();
        if ('error' in body) {
            return {};
        }
        const result = body.result[body.result.uids[0]];
        return {
            url: `https://www.ncbi.nlm.nih.gov/nuccore/${id}`,
            title: result.title,
            species: {
                tax_id: result.taxid,
                scientific_name: result.organism
            }
        };
    } else {
        return undefined;
    }
}
