import fetch from 'node-fetch';

import { IOMEGAPairedDataPlatform as ProjectDocument } from './schema';

interface Species {
    tax_id: number;
    scientific_name: string;
}

interface GenomeEnrichment {
    url: string;
    title?: string;
    species: Species;
}

interface GenomeEnrichments {
    [key: string]: GenomeEnrichment;
}

export interface ProjectEnrichments {
    genomes: GenomeEnrichments;
}

export async function enrich(project: ProjectDocument): Promise<ProjectEnrichments> {
    /**
     * Retrieve, calculate enrichments for a project.
     *
     * For example will retrieve species names based on genome identifier.
     */

    // return {
    //     "genomes": {
    //         "Streptomyces sp. CNB091": {
    //             "url": "https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000",
    //             "title": "Streptomyces sp. CNB091, whole genome shotgun sequencing project",
    //             "species": { "tax_id": 1169156, "scientific_name": "Streptomyces sp. CNB091" }
    //         }, "Streptomyces sp. CNH099": {
    //             "url": "https://www.ncbi.nlm.nih.gov/nuccore/AZWL01000000",
    //             "title": "Streptomyces sp. CNH099, whole genome shotgun sequencing project",
    //             "species": { "tax_id": 1137269, "scientific_name": "Streptomyces sp. CNH099" }
    //         }, "Salinispora arenicola CNB527": {
    //             "url": "https://www.ncbi.nlm.nih.gov/nuccore/AZXI01000001",
    //             "title": "Salinispora arenicola CNB527 B033DRAFT_scaffold_0.1_C, whole genome shotgun sequence",
    //             "species": { "tax_id": 1137250, "scientific_name": "Salinispora arenicola CNB527" }
    //         }
    //     }
    // };
    const genomes: GenomeEnrichments = {};
    for (const genome of project.genomes) {
        const genome_enrichment = await enrich_genome(genome);
        if (genome_enrichment) {
           genomes[genome.genome_label] = genome_enrichment;
        }
    }
    return {
        genomes
    };
}

async function enrich_genome(genome: any) {
    if ('GenBank_accession' in genome.genome_ID) {
        return await enrich_genbank(genome.genome_ID.GenBank_accession);
    }
    return undefined;
}

async function enrich_genbank(genbank_id: string) {
    return await esummary('nuccore', genbank_id);
}

async function esummary(db: string, id: string): Promise<GenomeEnrichment | undefined> {
    const url = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=${db}&id=${id}&retmode=json`;
    const response = await fetch(url);
    if (response.ok) {
        const body = await response.json();
        if ('error' in body) {
            return undefined;
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
