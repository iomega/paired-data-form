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

function collapseSamplePreparation(row: Map<String, any>) {
    // TODO implement
    return {};
}

function collapseExtractionMethod(row: Map<String, any>) {
    // TODO implement
    return {};
}

function collapseInstrumentationMethod(row: Map<String, any>) {
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
    const sample_preparations: any[] = [];
    const sample_preparation_labels = new Set();
    const extraction_methods: any[] = [];
    const extraction_method_labels = new Set();
    const instrumentation_methods: any[] = [];
    const instrumentation_method_labels = new Set();
    const gmRows: any[] = rows.map(r => {
        const namedRow: Map<String, any> = new Map(r.map((c: any, i: number) => [header[i], c]));
        const metabolomics_file = namedRow.get("Location of metabolomics data file");
        const sample_preparation_label = namedRow.get("Sample Growth Conditions Label");
        if (!sample_preparation_labels.has(sample_preparation_label)) {
            sample_preparations.push(collapseSamplePreparation(namedRow));
            sample_preparation_labels.add(sample_preparation_label);
        }
        const extraction_method_label = namedRow.get("Extraction Method Label");
        if (!extraction_method_labels.has(extraction_method_label)) {
            extraction_methods.push(collapseExtractionMethod(namedRow));
            extraction_method_labels.add(extraction_method_label);
        }
        const instrumentation_method_label = namedRow.get("Instrumentation Method Label");
        if (!instrumentation_method_labels.has(instrumentation_method_label)) {
            instrumentation_methods.push(collapseInstrumentationMethod(namedRow));
            instrumentation_method_labels.add(instrumentation_method_label);
        }
        return {
            "genome_ID": "AL645882", // TODO map genome id
            metabolomics_file,
            sample_preparation_label,
            extraction_method_label,
            instrumentation_method_label
        };
    });
    return {
        "version": "1",
        "personal": {},
        "metabolomics": {},
        genomes,
        "experimental": {
            sample_preparation: sample_preparations,
            extraction_methods,
            instrumentation_methods
        },
        "genome_metabolome_links": gmRows
    }
}