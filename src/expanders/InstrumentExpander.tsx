import * as React from "react";

import { IExpander } from "./AbstractExpander";

export class InstrumentExpander implements IExpander {
  public fk = "instrumentation_method_label";
  private foreignTable = "instrumentation_methods";
  private labelField = "instrumentation_method";
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

  private headers() {
    return Object.keys(this.schema).map(k => this.schema[k].title);
  }

  private cols(row: any) {
    const typeKey = "instrumentation";
    const typeSchema = this.schema[typeKey];
    const modeKey = "mode";
    const modeSchema = this.schema[modeKey];
    return Object.keys(this.schema).map(k => {
      const v = row[k];
      if (k === typeKey) {
        const typeLabel = typeSchema.properties.instrument.anyOf.find(
          (r: any) => r.enum[0] === v.instrument
        ).title;
        if (typeLabel === "Other Mass Spectrometer") {
          return (
            <span key={row.instrumentation.other_instrument}>
              {row.instrumentation.other_instrument}
            </span>
          );
        }
        return (
          <a key={v.instrument} href={v.instrument}>
            {typeLabel}
          </a>
        );
      } else if (k === modeKey) {
        const modeLabel = modeSchema.anyOf.find((r: any) => r.enum[0] === v)
          .title;
        return (
          <a key={v} href={v}>
            {modeLabel}
          </a>
        );
      }
      return v;
    });
  }

  private find(row: any) {
    const label = row[this.fk];
    return this.lookup.find((r: any) => r[this.labelField] === label);
  }
}
