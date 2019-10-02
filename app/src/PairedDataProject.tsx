import * as React from "react";

import { Button, Glyphicon, Panel, ButtonGroup } from "react-bootstrap";
import { Link} from "react-router-dom";

import { GeneSpectraTable } from "./GeneSpectraTable";
import { GenomeMetabolomicsTable } from "./GenomeMetabolomicsTable";
import { EnrichedProjectDocument } from "./summarize";
import { MetabolomicsProjectDetails } from "./MetabolomicsProjectDetails";
import { SubmitterInformation } from "./SubmitterInformation";

interface IProps {
  project: EnrichedProjectDocument;
  schema: any;
}

function record2dataUrl(data: object, mimeType = "application/json") {
  const bj = btoa(JSON.stringify(data, null, 4));
  return `data:${mimeType};base64,${bj}`;
}

export const PairedDataProject = ({project, schema}: IProps) => {
  const project_id = project._id;
  const pure_project = project.project;
  const dataUrl = record2dataUrl(pure_project);
  const filename = `paired_datarecord_${project_id}.json`;
  return (
      <div>
          <h3>iOMEGA Paired data project: {project_id}</h3>

          <Panel>
            <Panel.Heading>Submitter Information</Panel.Heading>
            <Panel.Body><SubmitterInformation project_id={project._id} personal={pure_project.personal}/></Panel.Body>
          </Panel>
          <Panel>
            <Panel.Heading>Metabolomics project details</Panel.Heading>
            <Panel.Body><MetabolomicsProjectDetails data={pure_project.metabolomics}/></Panel.Body>
          </Panel>
          <Panel>
            <Panel.Heading>Links between genomes and metabolomics data</Panel.Heading>
            <Panel.Body><GenomeMetabolomicsTable data={project} schema={schema} /></Panel.Body>
          </Panel>
          <Panel>
            <Panel.Heading>Linked gene clusters and MS2 spectra</Panel.Heading>
            <Panel.Body style={{overflowY: 'auto'}}><GeneSpectraTable data={project} schema={schema} /></Panel.Body>
          </Panel>
          
          <ButtonGroup>
              <Button href={dataUrl} download={filename} ><Glyphicon glyph="download" /> Download</Button>
              <Link title="View history of project" className="btn btn-default" to={`/projects/${project_id}/history`}><Glyphicon glyph="sort" /> History</Link>
              <Link title="Edit project" className="btn btn-default" to={`/projects/${project_id}/edit`}><Glyphicon glyph="edit" /> Edit</Link>
              <Link title="Create new project based on this one" className="btn btn-default" to={`/projects/${project_id}/clone`}><Glyphicon glyph="retweet"/> Clone</Link>
          </ButtonGroup>
      </div>
  );
};
