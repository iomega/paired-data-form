import { IExpander } from './expanders/AbstractExpander';
import { ExtractionExpander } from './expanders/ExtractionExpander';
import { GenomeExpander } from './expanders/GenomeExpander';
import { InstrumentExpander } from './expanders/InstrumentExpander';
import { SampleGrowthConditionsExpander } from './expanders/SampleGrowthConditionsExpander';

export function textTable(schema: any, data: any): string[][] {
    const expanders: IExpander[] = [
        new GenomeExpander(schema, data),
        new SampleGrowthConditionsExpander(schema, data),
        new ExtractionExpander(schema, data),
        new InstrumentExpander(schema, data),
    ];
    const gmProps = schema.properties.genome_metabolome_links.items.properties;
    const foreignKeys = new Set(expanders.map(e => e.fk));
    const cols = Object.keys(gmProps).filter(k => !foreignKeys.has(k));
    const headers: string[] = cols.map((s) => {
        const field = gmProps[s];
        return field.title;
    });
    expanders.forEach(e => e.headers().forEach(h => headers.push(h)));
    const gmRows = data.genome_metabolome_links;
    const rows: string[][] = gmRows.map((row: any, i: number) => {
        const textRow = cols.map((td, tdi) => {
            return row[td];
        });
        expanders.forEach(e => e.textCols(row).forEach(c => textRow.push(c)));
        return textRow;
    });
    return [headers, ...rows];
}

function tsvExport(schema: any, data: any) {
    const newline = '\n';
    const sep = '\t';
    return textTable(schema, data).map(r => r.join(sep)).join(newline);
}

export function tsvUrl(schema: any, data: any) {
    const mimeType = 'text/tab-separated-values';
    const bj = btoa(tsvExport(schema, data));
    return `data:${mimeType};base64,${bj}`;
}

function label2value(label: string, oneOf: any[]) {
    const hit = oneOf.find(e => e.title === label);
    if (hit) {
        return hit.enum[0];
    }
    return hit;
}

function collapseSamplePreparation(row: Map<string, any>, schema: any) {
     const sample: any = {
        sample_preparation_method: row.get('Sample Growth Conditions Label'),
    }
 
    const mediumDetails = row.get('Medium details');
    const mediumMatches = /^(.*?) \((.*)\)$/.exec(mediumDetails);
    if (mediumMatches && mediumMatches.length === 3) {
        const mediumType = mediumMatches[2];
        const mediumLabel = mediumMatches[1];
        const mediumValue = label2value(mediumLabel, schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.properties.medium.anyOf);
        sample.medium_details = {medium_type: mediumType};
        if (mediumValue) {
            sample.medium_details.medium = mediumValue;
        } else {
            sample.medium_details.Other_medium = mediumLabel;
        }
    }
    const temp = row.get('Growth temperature');
    if (temp) {
        sample.growth_temperature = temp;
    }
    const aeration = row.get('Aeration');
    if (aeration) {
        sample.aeration = aeration;
    }
    const growingTime = row.get('Growth time');
    if (growingTime) {
        sample.growing_time = growingTime;
    }
    const phase = row.get('Growth phase or OD');
    if (phase) {
        sample.growth_phase_OD = phase;
    }
    const cond = row.get('Other growth conditions');
    if (cond) {
        sample.other_growth_conditions = cond;
    }
    const metagenomeLabel = row.get('Metagenome details');
    const metagenomeValue = label2value(metagenomeLabel, schema.properties.experimental.properties.sample_preparation.items.properties.metagenome_details.properties.environment.anyOf);
    if (metagenomeValue) {
        sample.metagenome_details = {environment: metagenomeValue};
    } else {
        sample.metagenome_details = {Other_environment: metagenomeLabel};
    }
    const metadesc = row.get('Metagenomic sample description');
    if (metadesc) {
        sample.metagenomic_sample_description = metadesc;
    }
    return sample;
}

function collapseExtractionMethod(row: Map<string, any>, schema: any) {
    const extract: any = {
        extraction_method: row.get('Extraction Method Label'),
        solvents: []
    };
    const solventsString: string = row.get('Extraction solvent');
    solventsString.split(';').forEach(solventString => {
        const [solventLabel, ratio] = solventString.split('=');
        const solventValue = label2value(solventLabel, schema.properties.experimental.properties.extraction_methods.items.properties.solvents.items.properties.solvent.anyOf);
        if (solventValue) {
            extract.solvents.push({
                solvent: solventValue, 
                ratio: parseFloat(ratio)
            });
        } else {
            extract.solvents.push({
                Other_solvent: solventLabel, 
                ratio: parseFloat(ratio)
            });
        }
    });
    const other = row.get('Other extraction details');
    if (other) {
        extract.other_extraction_parameters = other;
    }
    return extract;
}

function collapseInstrumentationMethod(row: Map<string, any>, schema: any) {
    const instr: any = {
        instrumentation_method: row.get('Instrumentation Method Label')
    };
    const instrTypeLabel = row.get('Instrumentation');
    const instrTypeValue = label2value(instrTypeLabel, schema.properties.experimental.properties.instrumentation_methods.items.properties.instrumentation.properties.instrument.anyOf);
    if (instrTypeValue) {
        instr.instrumentation = {instrument: instrTypeValue}
    } else {
        instr.instrumentation = {other_instrument: instrTypeLabel}
    }
    const column = row.get('Column details');
    if (column) {
        instr.column = column;
    }
    const mode = row.get('Instrument mode');
    if (mode) {
        instr.mode = label2value(mode, schema.properties.experimental.properties.instrumentation_methods.items.properties.mode.anyOf);
    }
    const range = row.get('Mass range');
    if (range) {
        instr.range = range;
    }
    const coll = row.get('Collision energy');
    if (coll) {
        instr.collision_energy = coll;
    }
    const buf = row.get('Buffering');
    if (buf) {
        instr.buffering = buf;
    }
    const other = row.get('Other instrumentation information');
    if (other) {
        instr.other_instrumentation = other;
    }
    return instr;
}

function preferredGenomeID(row: Map<string, any>) {
    return row.get('GenBank accession number') || 
        row.get('RefSeq_accession number') ||
        row.get('ENA/NCBI accession number') ||
        row.get('MGnify accession number') ||
        row.get('BioSample accession number')
    ;
}

function collapseGenome(row: Map<string, any>) {
    const genome: any = {
        genome_ID: {
            genome_type: row.get('Genome or Metagenome')
        }
    };
    const genbankAccession = row.get('GenBank accession number');
    if (genbankAccession) {
        genome.genome_ID.GenBank_accession = genbankAccession;
    }
    const refseqAccession = row.get('RefSeq accession number');
    if (refseqAccession) {
        genome.genome_ID.RefSeq_accession = refseqAccession;
    }
    const ena = row.get('ENA/NCBI accession number');
    if (ena) {
        genome.genome_ID.ENA_NCBI_accession = ena;
    }
    const mgnify = row.get('MGnify accession number');
    if (mgnify) {
        genome.genome_ID.MGnify_accession = mgnify;
    }
    const biosample = row.get('BioSample accession number');
    if (biosample) {
        genome.BioSample_accession = biosample;
    }
    const pubs = row.get('Key publications');
    if (pubs) {
        genome.publications = pubs;
    }
    return genome;
}

export function jsonDocument(schema: any, table: any[]) {
    const header: string[] = table.shift();
    const rows = table;
    const genomes: any[] = [];
    const genomeIDs = new Set();
    const samplePreparations: any[] = [];
    const samplePreparationLabels = new Set();
    const extractionMethods: any[] = [];
    const extractionMethodLabels = new Set();
    const instrumentationMethods: any[] = [];
    const instrumentationMethodLabels = new Set();
    const gmRows: any[] = rows.map(r => {
        const namedRow: Map<string, any> = new Map(r.map((c: any, i: number) => [header[i], c]));
        const metabolomicsFile = namedRow.get("Location of metabolomics data file");
        const genomeID = preferredGenomeID(namedRow);
        if (!genomeIDs.has(genomeID)) {
            genomes.push(collapseGenome(namedRow));
            genomeIDs.add(genomeID);
        }
        const samplePreparationLabel = namedRow.get("Sample Growth Conditions Label");
        if (!samplePreparationLabels.has(samplePreparationLabel)) {
            samplePreparations.push(collapseSamplePreparation(namedRow, schema));
            samplePreparationLabels.add(samplePreparationLabel);
        }
        const extractionMethodLabel = namedRow.get("Extraction Method Label");
        if (!extractionMethodLabels.has(extractionMethodLabel)) {
            extractionMethods.push(collapseExtractionMethod(namedRow, schema));
            extractionMethodLabels.add(extractionMethodLabel);
        }
        const instrumentationMethodLabel = namedRow.get("Instrumentation Method Label");
        if (!instrumentationMethodLabels.has(instrumentationMethodLabel)) {
            instrumentationMethods.push(collapseInstrumentationMethod(namedRow, schema));
            instrumentationMethodLabels.add(instrumentationMethodLabel);
        }
        return {
            genome_ID: genomeID,
            metabolomics_file: metabolomicsFile,
            sample_preparation_label: samplePreparationLabel,
            extraction_method_label: extractionMethodLabel,
            instrumentation_method_label: instrumentationMethodLabel
        };
    });
    return {
        version: "1",
        personal: {},
        metabolomics: {},
        genomes,
        experimental: {
            sample_preparation: samplePreparations,
            extraction_methods: extractionMethods,
            instrumentation_methods: instrumentationMethods
        },
        genome_metabolome_links: gmRows
    }
}