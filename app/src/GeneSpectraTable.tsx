import * as React from "react";

import { Button, OverlayTrigger, Table } from "react-bootstrap";
import { makeGenomePopovers, makeSamplePopovers, makeExtractionPopovers, makeInstrumentPopovers, makeProteomePopovers } from "./popovers";

interface IProps {
  data: any;
  schema: any;
}

export const GeneSpectraTable = (props: IProps) => {
  const pure_project = props.data.project;
  if (!pure_project.BGC_MS2_links || pure_project.BGC_MS2_links.length === 0) {
    return <p>No links between biosynthetic gene clusters and MS/MS spectra.</p>;
  }
  const mySchema = props.schema.properties.BGC_MS2_links.items;
  const myProps = mySchema.properties;
  const depKey = "link";
  const bgcKey = "BGC_ID";

  const rows = pure_project.BGC_MS2_links.map((r: any, i: number) => {
    let { bgc, link } = bgcLinks(r);
    const has_quantitative_proteomics_experiment = r.omics_based_evidence &&
    r.omics_based_evidence.omics_based_evidence_type === 'Quantitative proteomics experiment';
    let quantitative_proteomics_experiment = <></>;
    const has_nonquantitative_proteomics_experiment = r.omics_based_evidence &&
    r.omics_based_evidence.omics_based_evidence_type === 'Nonquantitative proteomics experiment';
    let nonquantitative_proteomics_experiment = <></>;
    if (has_quantitative_proteomics_experiment) {
      const genome_enrichments = props.data.enrichments && props.data.enrichments.genomes ? props.data.enrichments.genomes : {};
      const genome_popovers: any = makeGenomePopovers(pure_project, genome_enrichments);
      const sample_popovers: any = makeSamplePopovers(pure_project, props);
      const extraction_popovers: any = makeExtractionPopovers(pure_project, props);
      const instrument_popovers: any = makeInstrumentPopovers(pure_project, props);
      const proteome_popovers: any = makeProteomePopovers(pure_project, genome_popovers, sample_popovers, extraction_popovers, instrument_popovers);

      const comparison_groups = r.omics_based_evidence.quantitative_proteomics_experiment.comparison_groups.map((g: any, j: string) => {
        let prot_url = (g.protein_id.protein_database === 'uniprot') ?
           'https://www.uniprot.org/uniprot/' + g.protein_id.protein_identifier :
           'https://www.ncbi.nlm.nih.gov/protein/' + g.protein_id.protein_identifier
        let prot_id = (g.protein_id.protein_database !== 'de novo') ?
            <a title="public protein identifier" href={prot_url}>{g.protein_id.protein_identifier}</a> :
            <span>De novo: {g.protein_id.protein_identifier}</span>
        return (
          <li id={j}>
            <p>Control:
              <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom"
                overlay={proteome_popovers[g.control_group]}
              >
                <Button bsStyle="link">
                  {g.control_group}
                </Button>
              </OverlayTrigger>
            </p>
            <p>Experimental:
            <OverlayTrigger
                trigger="click"
                rootClose
                placement="bottom"
                overlay={proteome_popovers[g.experimental_group]}
              >
                <Button bsStyle="link">
                  {g.experimental_group}
                </Button>
              </OverlayTrigger>
            </p>
            <p>Metabolite concentration change: {g.metabolite_concentration}</p>
            { g.protein_id.genome &&
              <p>Genome source:
                <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={genome_popovers[g.protein_id.genome]}
                  >
                    <Button bsStyle="link">
                      {g.protein_id.genome}
                    </Button>
                  </OverlayTrigger>
              </p>
            }
            <p>Protein identifier: {prot_id}</p>
            <p>Protein log<sub>2</sub> fold change (exp/cont): {g.protein_fold.protein_fold_change}{g.protein_fold.quantitation_type !== 'None' && <> based on {g.protein_fold.quantitation_type}</>}</p>
          </li>
        )
      });
      quantitative_proteomics_experiment = (
        <>
          <hr/>
          <p>Evidence of quantitative proteomics experiment: {r.omics_based_evidence.quantitative_proteomics_experiment.evidences}</p>
          <ul>
            {comparison_groups}
          </ul>
        </>
      );
    }
    if (has_nonquantitative_proteomics_experiment) {
      nonquantitative_proteomics_experiment = (
        <>
          <hr/>
          <p>Evidence of nonquantitative proteomics experiment: {r.omics_based_evidence.nonquantitative_proteomics_experiment.evidences}</p>
        </>
      );
    }
    return (
      <tr key={i}>
        <td>{r.known_link}</td>
        <td>
          {r.verification.join(', ')}
          {has_quantitative_proteomics_experiment && quantitative_proteomics_experiment }
          {has_nonquantitative_proteomics_experiment && nonquantitative_proteomics_experiment }
        </td>
        <td><div style={{maxWidth: '300px', overflow: 'auto'}}>{r.SMILES}</div></td>
        <td>{r.IUPAC}</td>
        <td>{bgc}</td>
        <td>{link}</td>
      </tr>
    );
  });

  return (
    <Table condensed={true} striped={true} bordered={true} responsive={true}>
      <thead>
        <tr>
          <td>{myProps['known_link'].title}</td>
          <td>{myProps['verification'].title}</td>
          <td title={myProps['SMILES'].title}>SMILES string</td>
          <td title={myProps['IUPAC'].title}>IUPAC name</td>
          <td>{myProps[bgcKey].title}</td>
          <td>{myProps[depKey].title}</td>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </Table>
  );
};

function bgcLinks(r: any) {
  let bgc;
  if (r.BGC_ID.BGC === 'MIBiG number associated with this exact BGC') {
    const bgc_id = r.BGC_ID.MIBiG_number;
    const bgc_url = `https://mibig.secondarymetabolites.org/repository/${bgc_id}/index.html`;
    const bgc_a = <a title="Exact BGC" href={bgc_url}>{bgc_id}</a>;
    bgc = bgc_a;
  } else {
    const bgc_id = r.BGC_ID.similar_MIBiG_number;
    const bgc_url = `https://mibig.secondarymetabolites.org/repository/${bgc_id}/index.html`;
    const bgc_a = <a title="Similar BGC" href={bgc_url}>{bgc_id}</a>;
    bgc = <span>Similar to {bgc_a} in strain {r.BGC_ID.strain} at {r.BGC_ID.coordinates} coordinates</span>;
  }
  let link;
  if (r.link === 'GNPS molecular family') {
    const network = new URL(r.network_nodes_URL).searchParams.get('task');
    const task_url = 'https://gnps.ucsd.edu/ProteoSAFe/status.jsp?task=' + network;
    const family = new URL(r.network_nodes_URL).searchParams.get('componentindex');
    link = <span>GNPS molecular family <a href={r.network_nodes_URL}>{family}</a> in <a href={task_url}>{network}</a> network</span>;
  } else {
    const filename = new URL(r.MS2_URL).pathname.split('/').pop();
    link = <span>molecule of MS2 scan {r.MS2_scan} in <a href={r.MS2_URL}>&hellip;/{filename}</a></span>;
  }
  return { bgc, link };
}
