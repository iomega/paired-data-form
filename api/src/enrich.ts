import fetch from 'node-fetch';
import { IOMEGAPairedDataPlatform, GenomeOrMetagenome } from './schema';

interface Species {
    tax_id: number;
    scientific_name: string;
}

interface GenomeEnrichment {
   url?: string;
   title?: string;
   species?: Species;
}

interface ProjectEnrichments {
    genomes: GenomeEnrichment[];
}

export async function enrich(project: IOMEGAPairedDataPlatform) {
    const enrichment: ProjectEnrichments = {
        genomes: []
    };
    for (const genome of project.genomes) {
        enrichment.genomes.push(await enrich_genome(genome));
    }
    return enrichment;
}

function enrich_genome(genome: any) {
    if ('GenBank_accession' in genome.genome_ID) {
        return enrich_genbank(genome.genome_ID.GenBank_accession);
    }
    return {};
}

function enrich_genbank(genbank_id: string) {
    return esummary('nuccore', genbank_id);
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