import * as React from "react";

import { IExpander } from "./AbstractExpander";

export class ExtractionExpander implements IExpander {
  public fk = "extraction_method_label";
  private foreignTable = "extraction_methods";
  private labelField = "extraction_method";
  private schema: any;
  private lookup: any[];

  constructor(schema: any, data: any) {
    this.schema =
      schema.properties.experimental.properties[
        this.foreignTable
      ].items.properties;
    this.lookup = data.experimental[this.foreignTable];
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
    return Object.keys(this.schema).map(k => this.schema[k].title);
  }

  public textCols(row: any): string[] {
    const foreignItem = this.find(row);
    return this.textColsOf(foreignItem);
  }

  private textColsOf(row: any) {
    const solventsKey = "solvents";
    const solventSchema = this.schema[solventsKey].items.properties.solvent;
    const sep = ';';
    return Object.keys(this.schema).map(k => {
      const v = row[k];
      if (k === solventsKey) {
        return v.map((s: any, i: number) => {
          const solventName = solventSchema.anyOf.find(
            (r: any) => r.enum[0] === s.solvent
          ).title;
          if (solventName === "Other solvent") {
            return `${s.Other_solvent}=${s.ratio}`;
          }
          return `${solventName}=${s.ratio}`;
        }).join(sep);
      }
      return v;
    });
  }

  private cols(row: any) {
    const solventsKey = "solvents";
    const solventSchema = this.schema[solventsKey].items.properties.solvent;
    return Object.keys(this.schema).map(k => {
      const v = row[k];
      if (k === solventsKey) {
        return v.map((s: any, i: number) => {
          const solventName = solventSchema.anyOf.find(
            (r: any) => r.enum[0] === s.solvent
          ).title;
          let sep = ";";
          if (v.length - 1 === i) {
            sep = "";
          }
          if (solventName === "Other solvent") {
            return (
              <span key={s.Other_solvent}>
                {s.Other_solvent}={s.ratio}
                {sep}
              </span>
            );
          }
          return (
            <span key={s.solvent}>
              <a href={s.solvent}>{solventName}</a>={s.ratio}
              {sep}
            </span>
          );
        });
      }
    });
  }

  private find(row: any) {
    const label = row[this.fk];
    return this.lookup.find((r: any) => r[this.labelField] === label);
  }
}
