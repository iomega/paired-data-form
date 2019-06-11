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

function collapseSamplePreparation(row: any, schema: any) {
    const sample: any = {
        sample_preparation_method: row['Sample Growth Conditions Label'],
        medium_details: {}
    }
    const type = row['Medium type'];
    if (type) {
        sample.medium_details.medium_type = type;
    }
    const mediumLabel = row['Growth medium'];
    if (mediumLabel) {
        const mediumValue = label2value(mediumLabel, schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.properties.medium.anyOf);
        if (mediumValue) {
            sample.medium_details.medium = mediumValue;
        } else {
            sample.medium_details.Other_medium = mediumLabel;
        }
    }
    const temp = row['Growth temperature'];
    if (temp) {
        sample.growth_temperature = temp*1;
    }
    const aeration = row.Aeration;
    if (aeration) {
        sample.aeration = aeration;
    }
    const growingTime = row['Growth time'];
    if (growingTime) {
        sample.growing_time = growingTime*1;
    }
    const phase = row['Growth phase or OD'];
    if (phase) {
        sample.growth_phase_OD = phase;
    }
    const cond = row['Other growth conditions'];
    if (cond) {
        sample.other_growth_conditions = cond;
    }
    const metagenomeLabel = row['Metagenome details'];
    const metagenomeValue = label2value(metagenomeLabel, schema.properties.experimental.properties.sample_preparation.items.properties.metagenome_details.properties.environment.anyOf);
    if (metagenomeValue) {
        sample.metagenome_details = {environment: metagenomeValue};
    } else {
        sample.metagenome_details = {Other_environment: metagenomeLabel};
    }
    const metadesc = row['Metagenomic sample description'];
    if (metadesc) {
        sample.metagenomic_sample_description = metadesc;
    }
    return sample;
}

function collapseExtractionMethod(row: any, schema: any) {
    const extract: any = {
        extraction_method: row['Extraction Method Label'],
        solvents: []
    };
    const solventsString: string = row['Extraction solvent'];
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
    const other = row['Other extraction details'];
    if (other) {
        extract.other_extraction_parameters = other;
    }
    return extract;
}

function collapseInstrumentationMethod(row: any, schema: any) {
    const instr: any = {
        instrumentation_method: row['Instrumentation Method Label']
    };
    const instrTypeLabel = row.Instrumentation;
    const instrTypeValue = label2value(instrTypeLabel, schema.properties.experimental.properties.instrumentation_methods.items.properties.instrumentation.properties.instrument.anyOf);
    if (instrTypeValue) {
        instr.instrumentation = {instrument: instrTypeValue}
    } else {
        instr.instrumentation = {other_instrument: instrTypeLabel}
    }
    const column = row['Column details'];
    if (column) {
        instr.column = column;
    }
    const mode = row['Instrument mode'];
    if (mode) {
        instr.mode = label2value(mode, schema.properties.experimental.properties.instrumentation_methods.items.properties.mode.anyOf);
    }
    const range = row['Mass range'];
    if (range) {
        instr.range = range;
    }
    const coll = row['Collision energy'];
    if (coll) {
        instr.collision_energy = coll;
    }
    const buf = row.Buffering;
    if (buf) {
        instr.buffering = buf;
    }
    const other = row['Other instrumentation information'];
    if (other) {
        instr.other_instrumentation = other;
    }
    return instr;
}

function collapseGenome(row: any) {
    const genome: any = {
        genome_ID: {
            genome_type: row['Genome type']
        },
        genome_label: row['Genome Label']
    };
    const genbankAccession = row['GenBank accession number'];
    if (genbankAccession) {
        genome.genome_ID.GenBank_accession = genbankAccession;
    }
    const refseqAccession = row['RefSeq accession number'];
    if (refseqAccession) {
        genome.genome_ID.RefSeq_accession = refseqAccession;
    }
    const ena = row['ENA/NCBI accession number'];
    if (ena) {
        genome.genome_ID.ENA_NCBI_accession = ena;
    }
    const mgnify = row['MGnify accession number'];
    if (mgnify) {
        genome.genome_ID.MGnify_accession = mgnify;
    }
    const biosample = row['BioSample accession number'];
    if (biosample) {
        genome.BioSample_accession = biosample;
    }
    const pubs = row['Key publications'];
    if (pubs) {
        genome.publications = pubs;
    }
    return genome;
}

export function jsonDocument(schema: any, rows: any) {
    const genomes: any[] = [];
    const genomeLabels = new Set();
    const samplePreparations: any[] = [];
    const samplePreparationLabels = new Set();
    const extractionMethods: any[] = [];
    const extractionMethodLabels = new Set();
    const instrumentationMethods: any[] = [];
    const instrumentationMethodLabels = new Set();
    const gmRows: any[] = rows.map((row: any) => {
        const metabolomicsFile = row['Location of metabolomics data file'];
        const genomeLabel = row['Genome Label'];
        if (!genomeLabels.has(genomeLabel)) {
            genomes.push(collapseGenome(row));
            genomeLabels.add(genomeLabel);
        }
        const samplePreparationLabel = row['Sample Growth Conditions Label'];
        if (!samplePreparationLabels.has(samplePreparationLabel)) {
            samplePreparations.push(collapseSamplePreparation(row, schema));
            samplePreparationLabels.add(samplePreparationLabel);
        }
        const extractionMethodLabel = row['Extraction Method Label'];
        if (!extractionMethodLabels.has(extractionMethodLabel)) {
            extractionMethods.push(collapseExtractionMethod(row, schema));
            extractionMethodLabels.add(extractionMethodLabel);
        }
        const instrumentationMethodLabel = row['Instrumentation Method Label'];
        if (!instrumentationMethodLabels.has(instrumentationMethodLabel)) {
            instrumentationMethods.push(collapseInstrumentationMethod(row, schema));
            instrumentationMethodLabels.add(instrumentationMethodLabel);
        }
        return {
            genome_label: genomeLabel,
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