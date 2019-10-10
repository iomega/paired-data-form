import { IOMEGAPairedDataPlatform } from './schema';

export function textTable(schema: any, data: any): string[][] {
    const gmProps = schema.properties.genome_metabolome_links.items.properties;
    const cols = Object.keys(gmProps);
    const headers: string[] = cols.map((s) => {
        const field = gmProps[s];
        return field.title;
    });

    const gmRows = data.genome_metabolome_links;
    const rows: string[][] = gmRows.map((row: any, i: number) => {
        return cols.map((td) => {
            return row[td];
        });
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

export function jsonDocument(project: IOMEGAPairedDataPlatform, rows: any[]) {
    if (!project.genomes) {
        throw new Error('No genomes or metagenomes have been defined');
    }
    if (!project.experimental.sample_preparation) {
        throw new Error('No sample growth conditions have been defined in the metabolomics experimental details section');
    }
    if (!project.experimental.extraction_methods) {
        throw new Error('No extraction methods have been defined in the metabolomics experimental details section');
    }
    if (!project.experimental.instrumentation_methods) {
        throw new Error('No instrumentation methods have been defined in the metabolomics experimental details section');
    }
    const genomeLabels = new Set(project.genomes.map(d => d.genome_label));
    const samplePreparationLabels = new Set(project.experimental.sample_preparation!.map(d => d.sample_preparation_method));
    const extractionMethodLabels = new Set(project.experimental.extraction_methods!.map(d => d.extraction_method));
    const instrumentationMethodLabels = new Set(project.experimental.instrumentation_methods!.map(d => d.instrumentation_method));
    const gmRows: any[] = rows.map((row: any) => {
        const metabolomicsFile = row['Location of metabolomics data file'];
        const genomeLabel = row['Genome/Metagenome'];
        if (!genomeLabels.has(genomeLabel)) {
            throw new Error(`${genomeLabel} is not known as genome label, please add the (meta)genome first`);
        }
        const samplePreparationLabel = row['Sample Growth Conditions'];
        if (!samplePreparationLabels.has(samplePreparationLabel)) {
            throw new Error(`${samplePreparationLabel} is not known as Sample Growth Conditions label, please add the sample growth condition first`);
        }
        const extractionMethodLabel = row['Extraction Method'];
        if (!extractionMethodLabels.has(extractionMethodLabel)) {
            throw new Error(`${extractionMethodLabel} is not known as extraction method label, please add the extraction method first`);
        }
        const instrumentationMethodLabel = row['Instrumentation Method'];
        if (!instrumentationMethodLabels.has(instrumentationMethodLabel)) {
            throw new Error(`${instrumentationMethodLabel} is not known as instrumentation method label, please add the instrumation method first`);
        }
        return {
            genome_label: genomeLabel,
            metabolomics_file: metabolomicsFile,
            sample_preparation_label: samplePreparationLabel,
            extraction_method_label: extractionMethodLabel,
            instrumentation_method_label: instrumentationMethodLabel
        };
    });
    return gmRows
}
