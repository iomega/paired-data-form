import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';

import { IOMEGAPairedOmicsDataPlatform as ProjectDocument } from './schema';

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

    // Mock response
    // return {
    //     'genomes': {
    //         'Streptomyces sp. CNB091': {
    //             'url': 'https://www.ncbi.nlm.nih.gov/nuccore/ARJI01000000',
    //             'title': 'Streptomyces sp. CNB091, whole genome shotgun sequencing project',
    //             'species': { 'tax_id': 1169156, 'scientific_name': 'Streptomyces sp. CNB091' }
    //         }, 'Streptomyces sp. CNH099': {
    //             'url': 'https://www.ncbi.nlm.nih.gov/nuccore/AZWL01000000',
    //             'title': 'Streptomyces sp. CNH099, whole genome shotgun sequencing project',
    //             'species': { 'tax_id': 1137269, 'scientific_name': 'Streptomyces sp. CNH099' }
    //         }, 'Salinispora arenicola CNB527': {
    //             'url': 'https://www.ncbi.nlm.nih.gov/nuccore/AZXI01000001',
    //             'title': 'Salinispora arenicola CNB527 B033DRAFT_scaffold_0.1_C, whole genome shotgun sequence',
    //             'species': { 'tax_id': 1137250, 'scientific_name': 'Salinispora arenicola CNB527' }
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
    let enrichment = undefined;
    if ('GenBank_accession' in genome.genome_ID) {
        enrichment = await enrich_genbank(genome.genome_ID.GenBank_accession);
    }
    if ('RefSeq_accession' in genome.genome_ID && !enrichment) {
        enrichment = await enrich_refseq(genome.genome_ID.RefSeq_accession);
    }
    if ('JGI_Genome_ID' in genome.genome_ID && !enrichment) {
        enrichment = await enrich_jgi(genome.genome_ID.JGI_Genome_ID);
    }
    if ('ENA_NCBI_accession' in genome.genome_ID && !enrichment) {
        enrichment = await enrich_ena(genome.genome_ID.ENA_NCBI_accession);
    }
    if ('BioSample_accession' in genome && !enrichment) {
        enrichment = await enrich_biosample(genome.BioSample_accession);
    }
    return enrichment;
}

async function enrich_genbank(genbank_id: string) {
    console.log('Enriching genbank: ' + genbank_id);
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
            url: `https://www.ncbi.nlm.nih.gov/${db}/${id}`,
            title: result.title,
            species: {
                tax_id: result.taxid,
                scientific_name: result.organism
            }
        };
    }
    return undefined;
}

async function enrich_refseq(refseq_id: string): Promise<GenomeEnrichment | undefined> {
    return undefined;
}


export function parse_JGITaxonDetail_page(body: string): GenomeEnrichment | undefined {
    const {document} = (new JSDOM(body)).window;
    const rows = document.querySelectorAll('#content_other > form > table > tbody > tr');
    let scientific_name;
    let tax_id;
    let jgi_id;
    let title;
    rows.forEach((tr) => {
        const label_elem = tr.querySelector('th');
        if (!label_elem) {
            return;
        }
        const label = label_elem.textContent;
        if (label === 'Organism Name') {
            scientific_name = tr.querySelector('td').textContent;
        }
        if (label === 'Taxon ID' || label === 'Taxon Object ID') {
            jgi_id = tr.querySelector('td').textContent;
        }
        if (label === 'NCBI Taxon ID') {
            tax_id = parseInt(tr.querySelector('td').textContent);
        }
        if (label === 'Study Name (Proposal Name)') {
            title = tr.querySelector('td').textContent;
        }
    });
    let enrichment: GenomeEnrichment | undefined = undefined;
    if (scientific_name && tax_id && jgi_id ) {
        enrichment = {
            url: `https://img.jgi.doe.gov/cgi-bin/m/main.cgi?section=TaxonDetail&page=taxonDetail&taxon_oid=${jgi_id}`,
            species: {
                tax_id,
                scientific_name
            }
        };
    }
    if (title) {
        enrichment['title'] = title;
    }
    return enrichment;
}

async function enrich_jgi(jgi_id: string): Promise<GenomeEnrichment | undefined> {
    console.log('Enriching JGI id: ' + jgi_id);
    const url = `https://img.jgi.doe.gov/cgi-bin/m/main.cgi?section=TaxonDetail&page=taxonDetail&taxon_oid=${jgi_id}`;
    const response = await fetch(url);
    if (response.ok) {
        const body = await response.text();
        return parse_JGITaxonDetail_page(body);
    }
    return undefined;
}

async function enrich_ena(ena_accession: string): Promise<GenomeEnrichment | undefined> {
    console.log('Enriching ENA accession: ' + ena_accession);
    const url = `https://www.ebi.ac.uk/ena/portal/api/filereport?result=read_run&accession=${ena_accession}&offset=0&limit=1&format=json&fields=experiment_title,tax_id,scientific_name`;
    const response = await fetch(url);
    if (response.ok && response.status !== 204) {
        const body = await response.json();
        // For now take info from first read file, in future might have an ENA experiment with different tax ids
        const row = body[0];
        return {
            url: `https://www.ebi.ac.uk/ena/browser/view/${ena_accession}`,
            title: row.experiment_title,
            species: {
                tax_id: parseInt(row.tax_id),
                scientific_name: row.scientific_name
            }
        };
    }
    return undefined;
}

async function enrich_biosample(biosample_accession: string): Promise<GenomeEnrichment | undefined> {
    console.log('Enriching BioSample: ' + biosample_accession);
    const url = `https://www.ebi.ac.uk/biosamples/samples/${biosample_accession}.json`;
    const response = await fetch(url);
    if (response.ok) {
        const body = await response.json();
        // Bail out on unknown tax id
        if (body.taxId === 0) {
            return undefined;
        }
        // Use first title and organism name
        const result = {
            url: body._links.self.href,
            title: body.characteristics.title ? body.characteristics.title[0].text : body.characteristics['description title'][0].text,
            species: {
                tax_id: parseInt(body.taxId),
                scientific_name: body.characteristics.organism[0].text
            }
        };
        return result;
    }
    return undefined;
}
