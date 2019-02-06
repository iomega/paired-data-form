import * as React from "react";

import { IExpander } from "./AbstractExpander";

export class SampleGrowthConditionsExpander implements IExpander {
    public fk = 'Sample_preparation_label';
    private foreignTable = 'Sample_Preparation';
    private labelField = 'Sample_preparation_Method';
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
        const mediumKey = 'medium';
        const mediumSchema = this.schema[mediumKey];
        const envKey = 'environment';
        const envSchema = this.schema[envKey];
        return Object.keys(this.schema).map(k => {
            const v = row[k];
            if (k === mediumKey) {
                const mediumIndex = mediumSchema.enum.indexOf(v);
                const mediumLabel = mediumSchema.enumNames[mediumIndex];
                return <a key={v} href={v}>{mediumLabel}</a>;
            } else if (k === envKey) {
                const envIndex = envSchema.enum.indexOf(v);
                const envLabel = envSchema.enumNames[envIndex];
                return <a key={v} href={v}>{envLabel}</a>;
            }
            return v;
        });
    }

    private find(row: any) {
        const label = row[this.fk];
        return this.lookup.find((r: any) => (r[this.labelField] === label));
    }
}
