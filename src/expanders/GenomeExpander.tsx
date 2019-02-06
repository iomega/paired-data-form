import * as React from "react";

import { IExpander } from './AbstractExpander';

export class GenomeExpander implements IExpander {
    public fk = 'Genome_Metagenome_ID';
    private foreignTable = 'genomes';
    private schema: any;
    private lookup: any[];

    constructor(schema: any, data: any) {
        this.schema = schema.properties[this.foreignTable].items.properties;
        this.lookup = data[this.foreignTable];
    }

    public ths(offset: number) {
        return this.headers().map((s, i) => <th key={i + offset}>{s}</th>);
    }

    public tds(row: any, offset: number) {
        const foreignItem = this.find(row);
        const foreignCols = this.cols(foreignItem);
        return foreignCols.map((td, tdi) => {
            return (<td key={tdi + offset}>{td}</td>);
        });
    }

    private headers() {
        return Object.keys(this.schema).map(k => this.schema[k].title);
    }

    private cols(row: object) {
        return Object.keys(this.schema).map(k => row[k]);
    }

    private find(row: any) {
        const genomeId = row[this.fk];
        return this.lookup.find((r: any) => (r.GenBank_accession === genomeId ||
            r.RefSeq_accession === genomeId ||
            r.ENA_NCBI_accession === genomeId ||
            r.MGnify_accession === genomeId || 
            r.BioSample_accession === genomeId));
    }
}
