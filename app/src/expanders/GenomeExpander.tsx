import * as React from "react";

import { IExpander } from "./AbstractExpander";
import { GenomeEnrichments } from "../summarize";

export class GenomeExpander implements IExpander {
  public fk = "genome_label";
  private foreignTable = "genomes";
  private labelField = "genome_label";
  private schema: any;
  private lookup: any[];

  constructor(schema: any, data: any, private enrichments: GenomeEnrichments = {}) {
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
      return <td key={tdi + offset}>{td}</td>;
    });
  }

  public headers() {
    const nestedProp = "genome_ID";
    const oneOfProp = "genome_type";
    const oneOfs = this.schema[nestedProp].dependencies[oneOfProp].oneOf;
    const nested: string[] = [];
    oneOfs.forEach((oneOf: any) => {
      Object.keys(oneOf.properties).forEach(k => {
        if (k === oneOfProp) {
          if (nested.indexOf(this.schema[nestedProp].title) === -1) {
            nested.push(this.schema[nestedProp].title);
          }
        } else if (nested.indexOf(oneOf.properties[k].title) === -1) {
          nested.push(oneOf.properties[k].title);
        }
      });
    });
    const lvl1 = Object.keys(this.schema)
      .filter(k => k !== nestedProp)
      .map(k => this.schema[k].title);
    return nested.concat(lvl1);
  }

  public textCols(row: any): string[] {
    const foreignItem = this.find(row);
    return this.cols(foreignItem);
  }

  private cols(row: any) {
    const nestedProp = "genome_ID";
    const oneOfProp = "genome_type";
    const oneOfs = this.schema[nestedProp].dependencies[oneOfProp].oneOf;
    const nested: string[] = [];
    const nestedValues: string[] = [];
    oneOfs.forEach((oneOf: any) => {
      Object.keys(oneOf.properties).forEach(k => {
        if (k === oneOfProp) {
          if (nested.indexOf(nestedProp) === -1) {
            nested.push(nestedProp);
            nestedValues.push(row[nestedProp][k]);
          }
        } else if (nested.indexOf(k) === -1) {
          nested.push(k);
          nestedValues.push(row[nestedProp][k]);
        }
      });
    });
    debugger
    const lvl1 = Object.keys(this.schema)
      .filter(k => k !== nestedProp)
      .map(k => {
        const enrichment = this.enrichments[row[k]];
        if (k === this.labelField && enrichment && enrichment.species) {
          return row[k] + '(' + enrichment.species.scientific_name + '/' + enrichment.species.tax_id + ')';
        };
        return row[k];
      });
    return nestedValues.concat(lvl1);
  }

  private find(row: any) {
    const label = row[this.fk];
    return this.lookup.find(
      (r: any) => r[this.labelField] === label
    );
  }
}
