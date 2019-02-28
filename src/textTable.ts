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

function collapseSamplePreparation(row: Map<string, any>) {
    // TODO implement
    return {};
}

function collapseExtractionMethod(row: Map<string, any>) {
    // TODO implement
    return {};
}

function collapseInstrumentationMethod(row: Map<string, any>) {
    // TODO implement
    return {};
}

export function jsonDocument(schema: any, table: any[]) {
    const header: string[] = table.shift();
    const colNames = new Map();
    header.forEach((d, i) => {
        colNames.set(d, i);
    })
    const rows = table;
    const genomes: any[] = [];
    const samplePreparations: any[] = [];
    const samplePreparationLabels = new Set();
    const extractionMethods: any[] = [];
    const extractionMethodLabels = new Set();
    const instrumentationMethods: any[] = [];
    const instrumentationMethodLabels = new Set();
    const gmRows: any[] = rows.map(r => {
        const namedRow: Map<string, any> = new Map(r.map((c: any, i: number) => [header[i], c]));
        const metabolomicsFile = namedRow.get("Location of metabolomics data file");
        const samplePreparationLabel = namedRow.get("Sample Growth Conditions Label");
        if (!samplePreparationLabels.has(samplePreparationLabel)) {
            samplePreparations.push(collapseSamplePreparation(namedRow));
            samplePreparationLabels.add(samplePreparationLabel);
        }
        const extractionMethodLabel = namedRow.get("Extraction Method Label");
        if (!extractionMethodLabels.has(extractionMethodLabel)) {
            extractionMethods.push(collapseExtractionMethod(namedRow));
            extractionMethodLabels.add(extractionMethodLabel);
        }
        const instrumentationMethodLabel = namedRow.get("Instrumentation Method Label");
        if (!instrumentationMethodLabels.has(instrumentationMethodLabel)) {
            instrumentationMethods.push(collapseInstrumentationMethod(namedRow));
            instrumentationMethodLabels.add(instrumentationMethodLabel);
        }
        return {
            "genome_ID": "AL645882", // TODO map genome id
            metabolomics_file: metabolomicsFile,
            sample_preparation_label: samplePreparationLabel,
            extraction_method_label: extractionMethodLabel,
            instrumentation_method_label: instrumentationMethodLabel
        };
    });
    return {
        "version": "1",
        "personal": {},
        "metabolomics": {},
        genomes,
        "experimental": {
            sample_preparation: samplePreparations,
            extraction_methods: extractionMethods,
            instrumentation_methods: instrumentationMethods
        },
        "genome_metabolome_links": gmRows
    }
}