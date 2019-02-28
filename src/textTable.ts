import { IExpander } from './expanders/AbstractExpander';
import { ExtractionExpander } from './expanders/ExtractionExpander';
import { GenomeExpander } from './expanders/GenomeExpander';
import { InstrumentExpander } from './expanders/InstrumentExpander';
import { SampleGrowthConditionsExpander } from './expanders/SampleGrowthConditionsExpander';
import { any } from 'prop-types';

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

export function jsonDocument(schema: any, data: any) {
    return {
        "version": "1",
        "personal": {},
        "metabolomics": {},
        "genomes": [],
        "experimental": {},
        "genome_metabolome_links": []        
    }
}