import * as React from "react";

import { IExpander } from "./AbstractExpander";
import { GenomeEnrichments } from "../summarize";
import { IOMEGAPairedDataPlatform } from "../schema";

export class GenomeExpander implements IExpander {
  public fk = "genome_label";
  private labelField = "genome_label";
  private schema: any;
  private lookup: any[];

  constructor(schema: any, data: IOMEGAPairedDataPlatform, private enrichments: GenomeEnrichments = {}) {
    this.schema = schema.properties.genomes.items.properties;
    this.lookup = data.genomes;
  }

  public ths(offset: number) {
    return this.headers().map((s, i) => {
      return (<th key={i + offset}>{s}</th>);
    });
  }

  public tds(row: any, offset: number) {
    const foreignItem = this.find(row);
    const foreignCols = this.cols(foreignItem);
    return foreignCols.map((td, tdi) => {
      if (tdi === 7) {
        if (td) {
          const tax_url = 'http://purl.bioontology.org/ontology/NCBITAXON/' + td.tax_id;
          return (<td key={tdi + offset}><a href={tax_url}>{td.scientific_name}</a></td>);
        } else {
          return (<td key={tdi + offset}></td>);
        }
      }
      return <td key={tdi + offset}>{td}</td>;
    });
  }

  public headers() {
    const oneOfs = this.schema.genome_ID.dependencies.genome_type.oneOf;
    return [
      this.schema.genome_ID.properties.genome_type.title,
      oneOfs[0].properties.GenBank_accession.title,
      oneOfs[0].properties.RefSeq_accession.title,
      oneOfs[1].properties.ENA_NCBI_accession.title,
      oneOfs[1].properties.MGnify_accession.title,
      this.schema.BioSample_accession.title,
      this.schema.publications.title,
      'Species',
      this.schema.genome_label.title,
    ];
  }
  
  public textCols(row: any): string[] {
    const foreignItem = this.find(row);
    return this.cols(foreignItem);
  }

  private cols(row: any) {
    let species;
    if (this.enrichments[row.genome_label]) {
      species = this.enrichments[row.genome_label].species;
    }
    return [
      row.genome_ID.genome_type,
      row.genome_ID.GenBank_accession,
      row.genome_ID.RefSeq_accession,
      row.genome_ID.ENA_NCBI_accession,
      row.genome_ID.MGnify_accession,
      row.BioSample_accession,
      row.publications,
      species,
      row.genome_label,
    ];
  }

  private find(row: any) {
    const label = row[this.fk];
    return this.lookup.find(
      (r: any) => r[this.labelField] === label
    );
  }
}
