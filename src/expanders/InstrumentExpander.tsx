import * as React from "react";

import { IExpander } from "./AbstractExpander";

export class InstrumentExpander implements IExpander {
    public fk = 'Instrumentation_method_label';
    private foreignTable = 'Instrumentation Methods';
    private labelField = 'Instrumentation_Method';
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
        const typeKey = 'instrument';
        const typeSchema = this.schema[typeKey];
        const modeKey = 'LCMS mode';
        const modeSchema = this.schema[modeKey];
        return Object.keys(this.schema).map(k => {
            const v = row[k];
            if (k === typeKey) {
                const typeIndex = typeSchema.enum.indexOf(v);
                const typeLabel = typeSchema.enumNames[typeIndex];
                return <a key={v} href={v}>{typeLabel}</a>;
            } else if (k === modeKey) {
                const modeIndex = modeSchema.enum.indexOf(v);
                const modeLabel = modeSchema.enumNames[modeIndex];
                return <a key={v} href={v}>{modeLabel}</a>;
            }
            return v;
        });
    }

    private find(row: any) {
        const label = row[this.fk];
        return this.lookup.find((r: any) => (r[this.labelField] === label));
    }
}
