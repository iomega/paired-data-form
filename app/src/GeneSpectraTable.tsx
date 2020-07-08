import * as React from "react";

import { Table } from "react-bootstrap";

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
    let bgc;
    if (r.BGC_ID.BGC === 'MIBiG number associated with this exact BGC') {
      const bgc_id = r.BGC_ID.MIBiG_number;
      const bgc_url = `https://mibig.secondarymetabolites.org/repository/${bgc_id}/index.html`;
      const bgc_a = <a title="Exact BGC" href={bgc_url}>{ bgc_id }</a>;
      bgc = bgc_a;
    } else {
      const bgc_id = r.BGC_ID.similar_MIBiG_number;
      const bgc_url = `https://mibig.secondarymetabolites.org/repository/${bgc_id}/index.html`;
      const bgc_a = <a title="Similar BGC" href={bgc_url}>{ bgc_id }</a>;
      bgc = <span>Similar to {bgc_a} in strain {r.BGC_ID.strain} at {r.BGC_ID.coordinates} coordinates</span>;
    }
    let link;
    if (r.link === 'GNPS molecular family') {
      const network = new URL(r.network_nodes_URL).searchParams.get('task');
      const task_url = 'https://gnps.ucsd.edu/ProteoSAFe/status.jsp?task=' + network;
      const family = new URL(r.network_nodes_URL).searchParams.get('componentindex');
      link = <span>GNPS molecular family <a href={r.network_nodes_URL}>{family}</a> in <a href={task_url}>{network}</a> network</span>
    } else {
      const filename = new URL(r.MS2_URL).pathname.split('/').pop();
      link = <span>molecule of MS2 scan {r.MS2_scan} in <a href={r.MS2_URL}>&hellip;/{filename}</a></span>
    }
    return (
      <tr key={i}>
        <td>{r.known_link}</td>
        <td>{r.verification.join(', ')}</td>
        <td>{r.SMILES}</td>
        <td>{r.IUPAC}</td>
        <td>{bgc}</td>
        <td>{link}</td>
      </tr>
    );
  });

  return (
    <Table condensed={true} striped={true} bordered={true}>
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
