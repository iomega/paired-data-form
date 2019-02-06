import * as React from "react";

import { IExpander } from "./AbstractExpander";

export class ExtractionExpander implements IExpander {
    public fk = 'Extraction_method_label';
    private foreignTable = 'Extraction Methods';
    private labelField = 'Extraction_Method';
    private schema: any;
    private lookup: any[];

    constructor(schema: any, data: any) {
        this.schema = schema.properties.data_to_link.properties.Experimental_details.properties[this.foreignTable].items.properties;
        this.lookup = data.data_to_link.Experimental_details[this.foreignTable];
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
        const solventsKey = 'Extraction solvent(s)';
        const solventSchema = this.schema[solventsKey].items.properties.solvent;
        return Object.keys(this.schema).map(k => {
            const v = row[k];
            if (k === solventsKey) {
                return v.map((s: any) => {
                    const solventIndex = solventSchema.enum.indexOf(s.solvent);
                    const solventName = solventSchema.enumNames[solventIndex];
                    return (<span key={s.solvent}><a href={s.solvent}>{solventName}</a>={s.ratio}</span>);
                });
            }
            return v;
        });
    }

    private find(row: any) {
        const label = row[this.fk];
        return this.lookup.find((r: any) => (r[this.labelField] === label));
    }
}
