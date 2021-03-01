import * as React from "react";

import { Panel } from "react-bootstrap";
import { Helmet } from "react-helmet";
import { CreativeWork, Dataset } from "schema-dts";
import { helmetJsonLdProp } from "react-schemaorg";

import { GeneSpectraTable } from "./GeneSpectraTable";
import { GenomeMetabolomicsTable } from "./GenomeMetabolomicsTable";
import { EnrichedProjectDocument } from "./summarize";
import { MetabolomicsProjectDetails } from "./MetabolomicsProjectDetails";
import { SubmitterInformation } from "./SubmitterInformation";
import { ProjectActions } from "./ProjectActions";
import { record2dataUrl } from "./record2dataUrl";
import { isMetaboLights } from "./typeguards";
import { publicationLinks } from "./Publications";

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
  const metabolomics = pure_project.metabolomics;

  const bgc_ms2_links = pure_project.BGC_MS2_links;
  const metabolomics_id = isMetaboLights(metabolomics.project) ? metabolomics.project.metabolights_study_id : metabolomics.project.GNPSMassIVE_ID;
  const description = `Paired Omics Data Platform project of ${metabolomics_id} metabolome` +
    ` with ${pure_project.genome_metabolome_links.length} (Meta)Genome - Metabolome links and` +
    ` ${bgc_ms2_links ? bgc_ms2_links.length : 0} BGC - MS/MS links`;

  type DctDataset = Dataset & {
    "http://purl.org/dc/terms/conformsTo": CreativeWork;
  };
  const dataset: DctDataset = {
    "@type": "Dataset",
    identifier: `https://pairedomicsdata.bioinformatics.nl/project/${project_id}`,
    "http://purl.org/dc/terms/conformsTo": { "@type": "CreativeWork", "@id": "https://bioschemas.org/profiles/Dataset/0.3-RELEASE-2019_06_14/" },
    url: `https://pairedomicsdata.bioinformatics.nl/project/${project_id}`,
    name: `Project ${project_id}`,
    description,
    license: 'https://creativecommons.org/licenses/by/4.0/legalcode',
    distribution: [{
      "@type": "DataDownload",
      encodingFormat: "application/json",
      contentUrl: `https://pairedomicsdata.bioinformatics.nl/api/projects/${project_id}`
    }],
    keywords: [
      "metabolomics",
      "genomics",
      "biosynthetic gene cluster",
      "tandem mass spectrometry",
    ],
    includedInDataCatalog: {
      "@type": "DataCatalog",
      "@id": "https://pairedomicsdata.bioinformatics.nl",
    },
    creator: {
      "@type": "Person",
      "name": pure_project.personal.submitter_name,
      "sameAs": pure_project.personal.submitter_orcid,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "correspondence",
        "email": pure_project.personal.submitter_email
      }
    },
    accountablePerson: {
      "@type": "Person",
      "name": pure_project.personal.PI_name,
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "correspondence",
        "email": pure_project.personal.PI_email
      },
      "affiliation": {
        "@type": "Organization",
        "name": pure_project.personal.PI_institution
      }
    },
    // api does not return version of dataset, so assume any after '.' is version
    version: project._id.slice(project._id.indexOf('.') + 1)
  };
  if (pure_project.metabolomics.publications) {
    dataset.citation = publicationLinks(pure_project.metabolomics.publications)[0][1];
  }
  const jsonld = helmetJsonLdProp<Dataset>({
    "@context": "https://schema.org",
    ...dataset
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
        <Panel.Body><MetabolomicsProjectDetails data={metabolomics} /></Panel.Body>
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
