import * as React from "react";
import { Table, Button, Popover, OverlayTrigger } from 'react-bootstrap';
import { IOMEGAPairedOmicsDataPlatform } from "./schema";
import { Publications } from "./Publications";
import { IProps } from "./GenomeMetabolomicsTable";

export function makeProteomePopovers(pure_project: IOMEGAPairedOmicsDataPlatform, genome_popovers: any, sample_popovers: any, extraction_popovers: any, instrument_popovers: any) {
  const proteome_popovers: any = {};
  const proteomes = pure_project.proteomes ? pure_project.proteomes : [];
  proteomes.forEach((p) => {
    let database_name = p.raw_data.database.database_name;
    if (database_name === 'Other') {
      database_name = p.raw_data.database.other_database_name;
    }
    let targets = targetsOfEnrichedProteome(p);
    const peptide_labelling = p.method.peptide_labelling === 'Custom' ? p.method.custom_peptide_labelling : p.method.peptide_labelling;
    const r = p.experimental_details ? p.experimental_details : {};
    debugger
    const popover = (
      <Popover id={p.proteome_label} title="Proteome">
        <p>Type: {p.proteome_ID.proteome_type}</p>
        {p.proteome_ID.targets && <span>Targets: <ul>{targets}</ul></span>}
        <p>Database: {database_name}</p>
        <p>Link to raw data: <a href={p.raw_data.proteome_data_link}>{p.raw_data.proteome_data_link}</a></p>
        <p>Anaysis mode: {p.method.analysis_mode}</p>
        {p.method.genome_label &&
          <p>Genome used for DDA:
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={genome_popovers[p.method.genome_label]}
            >
              <Button bsStyle="link">
                {p.method.genome_label}
              </Button>
            </OverlayTrigger>
          </p>}
        <p>Peptide labelling: {peptide_labelling}</p>
        {r.sample_preparation_label &&
          <p>Sample Growth Conditions:
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={sample_popovers[r.sample_preparation_label]}
            >
              <Button bsStyle="link">
                {r.sample_preparation_label}
              </Button>
            </OverlayTrigger>
          </p>}
        {r.instrumentation_method_label &&
          <p>Instrumentation Method:
            <OverlayTrigger
              trigger="click"
              rootClose
              placement="bottom"
              overlay={instrument_popovers[r.instrumentation_method_label]}
            >
              <Button bsStyle="link">
                {r.instrumentation_method_label}
              </Button>
            </OverlayTrigger>
          </p>}
        <p>Key publications: <Publications publications={p.more_info.publications!} /></p>
        <p>Notes: {p.more_info.notes}</p>
      </Popover>
    );
    proteome_popovers[p.proteome_label] = popover;
  });
  return proteome_popovers;
}

function targetsOfEnrichedProteome(p: any) {
  let targets = <></>;
  if (p.proteome_ID.targets) {
    targets = p.proteome_ID.targets.map((t: any) => {
      let target = t.target;
      if (target === 'other') {
        target = t.other_target;
      }
      return <li id={target}>{target}</li>;
    });
  }
  return targets;
}

export function makeInstrumentPopovers(pure_project: IOMEGAPairedOmicsDataPlatform, props: IProps) {
  const instrument_popovers: any = {};
  pure_project.experimental.instrumentation_methods!.forEach(i => {
    const any_instrument = props.schema.properties.experimental.properties.instrumentation_methods.items.properties.instrumentation.properties.instrument.anyOf;
    let instrument;
    if (i.instrumentation!.instrument === 'http://purl.obolibrary.org/obo/MS_1000443') {
      instrument = i.instrumentation!.other_instrument;
    } else {
      const instrument_title = any_instrument.find((r: any) => r.enum[0] === i.instrumentation!.instrument).title;
      instrument = <a href={i.instrumentation!.instrument}>{instrument_title}</a>;
    }
    const any_mode = props.schema.properties.experimental.properties.instrumentation_methods.items.properties.mode.anyOf;
    const mode_title = any_mode.find((r: any) => r.enum[0] === i.mode).title;
    let type = <></>;
    if (i.ionization && i.ionization.ionization_type) {
      if (i.ionization.ionization_type === 'http://purl.obolibrary.org/obo/MS_1000008') {
        type = i.ionization.other_ionization_type;
      } else {
        const any_type = props.schema.properties.experimental.properties.instrumentation_methods.items.properties.ionization.properties.ionization_type.anyOf;
        const type_url = i.ionization.ionization_type;
        const type_title = any_type.find((r: any) => r.enum[0] === type_url).title;
        type = <a href={type_url}>{type_title}</a>;
      }
    }
    const popover = (
      <Popover id={i.instrumentation_method} title="Instrumentation method">
        <p>Type: {instrument}</p>
        <p>Column phase: {i.column}</p>
        <span>Ionization:
          <ul>
            <li>Mode: <a href={i.mode}>{mode_title}</a></li>
            <li>Type: {type}</li>
          </ul>
        </span>
        <p>Mass range (Da): {i.range}</p>
        <p>Collision energy: {i.collision_energy}</p>
        <p>Mobile phase conditions: {i.buffering}</p>
        <p>Other: {i.other_instrumentation}</p>
      </Popover>
    );
    instrument_popovers[i.instrumentation_method] = popover;
  });
  return instrument_popovers;
}

export function makeExtractionPopovers(pure_project: IOMEGAPairedOmicsDataPlatform, props: IProps) {
  const extraction_popovers: any = {};
  pure_project.experimental.extraction_methods!.forEach((e) => {
    let solvent_table;
    const any_solvent = props.schema.properties.experimental.properties.extraction_methods.items.properties.solvents.items.properties.solvent.anyOf;
    if (e.solvents!.length === 1 && e.solvents![0].ratio === 1) {
      const s = e.solvents![0];
      if (s.solvent === 'http://purl.obolibrary.org/obo/CHEBI_46787') {
        solvent_table = <p>Solvent: {s.Other_solvent}</p>;
      } else {
        const solvent_title = any_solvent.find((r: any) => s.solvent === r.enum[0]).title;
        solvent_table = <p>Solvent: <a href={s.solvent}>{solvent_title}</a></p>;
      }
    } else {
      const solvents = e.solvents!.map(s => {
        let solvent;
        if (s.solvent === 'http://purl.obolibrary.org/obo/CHEBI_46787') {
          solvent = s.Other_solvent;
        } else {
          const solvent_title = any_solvent.find((r: any) => s.solvent === r.enum[0]).title;
          solvent = <a href={s.solvent}>{solvent_title}</a>;
        }
        return (
          <tr key={s.solvent}>
            <td>{solvent}</td>
            <td>{s.ratio}</td>
          </tr>
        );
      });
      solvent_table = (
        <Table condensed={true} striped={true} bordered={true}>
          <thead>
            <tr>
              <th>Solvent</th>
              <th>Ratio</th>
            </tr>
          </thead>
          <tbody>
            {solvents}
          </tbody>
        </Table>
      );
    }
    let extracted_material = '';
    if (e.extracted_material) {
      const oneof_extracted_material = props.schema.properties.experimental.properties.extraction_methods.items.properties.extracted_material.oneOf;
      extracted_material = oneof_extracted_material.find((r: any) => e.extracted_material === r.enum[0]).title;
    }
    const popover = (
      <Popover id={e.extraction_method} title="Extraction method">
        {solvent_table}
        {e.resins && <p>Resins: {e.resins}</p>}
        <p>Extracted material: {extracted_material}</p>
        <p>Other extraction details: {e.other_extraction_parameters}</p>
      </Popover>
    );
    extraction_popovers[e.extraction_method] = popover;
  });
  return extraction_popovers;
}

export function makeSamplePopovers(pure_project: IOMEGAPairedOmicsDataPlatform, props: IProps) {
  const sample_popovers: any = {};
  pure_project.experimental.sample_preparation!.forEach((s) => {
    let medium;
    if (s.medium_details.medium_type === 'metagenome') {
      let environment = <></>;
      if (s.medium_details.metagenomic_environment === 'other') {
        environment = s.medium_details.metagenomic_other_environment;
      } else if (s.medium_details.metagenomic_environment) {
        const any_env = props.schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.dependencies.medium_type.oneOf[0].properties.metagenomic_environment.oneOf;
        const env_title = any_env.find((r: any) => r.enum[0] === s.medium_details.metagenomic_environment).title;
        environment = <a href={s.medium_details.metagenomic_environment}>{env_title}</a>;
      }
      medium = (
        <span>Metagenome details
          <ul>
            <li>Host or isolation source: {environment}</li>
            <li>Sample description: {s.medium_details.metagenomic_sample_description}</li>
          </ul>
        </span>
      );
    } else {
      let medium_title = '';
      let medium_url = '';
      if (s.medium_details.medium === 'other') {
        medium_title = s.medium_details.Other_medium;
        medium_url = s.medium_details.Other_medium_link;
      } else if (s.medium_details.medium) {
        const any_medium = props.schema.properties.experimental.properties.sample_preparation.items.properties.medium_details.dependencies.medium_type.oneOf[1].properties.medium.anyOf;
        medium_title = any_medium.find((r: any) => r.enum[0] === s.medium_details.medium).title;
        medium_url = s.medium_details.medium;
      }
      medium = (
        <>
          <p>Growth medium: <a href={medium_url}>{medium_title}</a></p>
          {s.medium_details.medium_volume && <p>Volume of culture (ml): {s.medium_details.medium_volume}</p>}
        </>
      );
    }
    const popover = (
      <Popover id={s.sample_preparation_method} title="Sample growth conditions">
        <p>Medium type: {s.medium_details.medium_type}</p>
        {medium}
        <span>Growth parameters
          <ul>
            <li>Temperature (&deg; C): {s.growth_parameters.growth_temperature}</li>
            <li>Duration (hours): {s.growth_parameters.growth_duration}</li>
            <li>Growth phase or OD: {s.growth_parameters.growth_phase_OD}</li>
          </ul>
        </span>
        <span>Aeration:
          <ul>
            <li>Type: {s.aeration.aeration_type}</li>
            {s.aeration.aeration_vessel && <li>Vessel: {s.aeration.aeration_vessel}</li>}
            {s.aeration.aeration_other_vessel && <li>Vessel: {s.aeration.aeration_other_vessel}</li>}
            {s.aeration.aeration_rpm && <li>RPM: {s.aeration.aeration_rpm}</li>}
          </ul>
        </span>
        <p>Other conditions: {s.other_growth_conditions}</p>
      </Popover>
    );
    sample_popovers[s.sample_preparation_method] = popover;
  });
  return sample_popovers;
}

export function makeGenomePopovers(pure_project: IOMEGAPairedOmicsDataPlatform, genome_enrichments: any) {
  const genome_popovers: any = {};
  pure_project.genomes.forEach((g) => {
    let species = <></>;
    const s = genome_enrichments[g.genome_label];
    if (s) {
      const tax_url = 'https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=' + s.species.tax_id;
      species = <a href={tax_url}>{s.species.scientific_name}</a>;
    }
    const bs_url = `https://www.ncbi.nlm.nih.gov/biosample/${g.BioSample_accession}`;
    if (g.genome_ID.genome_type === 'metagenome') {
      const ena_url = `https://www.ebi.ac.uk/ena/browser/view/${g.genome_ID.ENA_NCBI_accession}`;
      const mgnify_url = `https://www.ebi.ac.uk/metagenomics/studies/${g.genome_ID.MGnify_accession}`;
      const jgi_url = `https://img.jgi.doe.gov/cgi-bin/m/main.cgi?section=TaxonDetail&taxon_oid=${g.genome_ID.JGI_ID}`;
      const popover = (
        <Popover id={g.genome_label} title="Metagenome">
          <p>ENA/NCBI accession number: <a href={ena_url}>{g.genome_ID.ENA_NCBI_accession}</a></p>
          <p>MGnify accession number: <a href={mgnify_url}>{g.genome_ID.MGnify_accession}</a></p>
          <p>JGI: <a href={jgi_url}>{g.genome_ID.JGI_ID}</a></p>
          <p>Biosample: <a href={bs_url}>{g.BioSample_accession}</a></p>
          <p>Key publications: <Publications publications={g.publications!} /></p>
          <p>Species: {species}</p>
        </Popover>
      );
      genome_popovers[g.genome_label] = popover;
    } else {
      const gb_url = `https://www.ncbi.nlm.nih.gov/nuccore/${g.genome_ID.GenBank_accession}`;
      const rs_url = `https://www.ncbi.nlm.nih.gov/nuccore/${g.genome_ID.RefSeq_accession}`;
      const jgi_url = `https://img.jgi.doe.gov/cgi-bin/m/main.cgi?section=TaxonDetail&page=taxonDetail&taxon_oid=${g.genome_ID.JGI_Genome_ID}`;
      const popover = (
        <Popover id={g.genome_label} title="Genome or metagenome-assembled genome">
          <p>GenBank: <a href={gb_url}>{g.genome_ID.GenBank_accession}</a></p>
          <p>RefSeq: <a href={rs_url}>{g.genome_ID.RefSeq_accession}</a></p>
          <p>JGI: <a href={jgi_url}>{g.genome_ID.JGI_Genome_ID}</a></p>
          <p>Biosample: <a href={bs_url}>{g.BioSample_accession}</a></p>
          <p>Key publications: <Publications publications={g.publications!} /></p>
          <p>Species: {species}</p>
        </Popover>
      );
      genome_popovers[g.genome_label] = popover;
    }
  });
  return genome_popovers;
}
