import * as React from "react";

import { Panel } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { Dataset } from "schema-dts";
import { helmetJsonLdProp } from "react-schemaorg";

import { GeneSpectraTable } from "./GeneSpectraTable";
import { GenomeMetabolomicsTable } from "./GenomeMetabolomicsTable";
import { EnrichedProjectDocument } from "./summarize";
import { MetabolomicsProjectDetails } from "./MetabolomicsProjectDetails";
import { SubmitterInformation } from "./SubmitterInformation";
import { ProjectActions } from "./ProjectActions";
import { record2dataUrl } from "./record2dataUrl";
import { jsonldDataCatalog } from "./constants";

interface IProps {
  project: EnrichedProjectDocument;
  schema: any;
  inreview?: boolean;
}

export const PairedDataProject = ({ project, schema, inreview = false }: IProps) => {
  const project_id = project._id;
  const pure_project = project.project;
  const data_url = record2dataUrl(pure_project);
  const filename = `paired_datarecord_${project_id}.json`;

  const bgc_ms2_links = pure_project.BGC_MS2_links;
  const description = `Paired Omics Data Platform project by ${pure_project.personal.PI_name}` +
    ` with ${bgc_ms2_links ? bgc_ms2_links.length : 0} (Meta)Genome - Metabolome links and` +
    ` ${pure_project.BGC_MS2_links?.length} BGC - MS/MS links`;
  const jsonld = helmetJsonLdProp<Dataset>({
    "@context": "https://schema.org",
    "@type": "Dataset",
    identifier: [`https://pairedomicsdata.bioinformatics.nl/project/${project_id}`],
    url: `https://pairedomicsdata.bioinformatics.nl/project/${project_id}`,
    name: `Project ${project_id}`,
    description,
    license: 'https://creativecommons.org/licenses/by/4.0/legalcode',
    distribution: [{
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `https://pairedomicsdata.bioinformatics.nl/api/projects/${project_id}`
    }],
    includedInDataCatalog: jsonldDataCatalog
  }, { space: 2 });
  return (
    <div>
      <Helmet script={[jsonld]} />
      <h3>Project</h3>

      <div>Identifier: {project_id}</div>
      <ProjectActions project_id={project_id} data_url={data_url} filename={filename} inreview={inreview} />

      <Panel>
        <Panel.Heading>Submitter Information</Panel.Heading>
        <Panel.Body><SubmitterInformation project_id={project._id} personal={pure_project.personal} /></Panel.Body>
      </Panel>
      <Panel>
        <Panel.Heading>Metabolomics project details</Panel.Heading>
        <Panel.Body><MetabolomicsProjectDetails data={pure_project.metabolomics} /></Panel.Body>
      </Panel>
      <Panel>
        <Panel.Heading>Links between (meta)genomes and metabolomics data</Panel.Heading>
        <Panel.Body><GenomeMetabolomicsTable data={project} schema={schema} /></Panel.Body>
      </Panel>
      <Panel>
        <Panel.Heading>Linked biosynthetic gene clusters and MS/MS spectra</Panel.Heading>
        <Panel.Body style={{ overflowY: 'auto' }}><GeneSpectraTable data={project} schema={schema} /></Panel.Body>
      </Panel>
      <ProjectActions project_id={project_id} data_url={data_url} filename={filename} inreview={inreview} />
    </div>
  );
};
