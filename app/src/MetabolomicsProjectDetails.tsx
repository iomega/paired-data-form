import * as React from 'react';
import { OverallMetabolomicsProjectDetails } from './schema';
import { isMetaboLights } from './typeguards';

interface IProps {
  data: OverallMetabolomicsProjectDetails;
}

export const MetabolomicsProjectDetails = ({ data }: IProps) => {
  const project = data.project;
  if (isMetaboLights(project)) {
    return (
      <ul>
        <li>Metabolights study identifier: <a href="https://www.ebi.ac.uk/metabolights/{repo.metabolights_study_id}">{project.metabolights_study_id}</a></li>
        <li>Publications: {data.publications}</li>
      </ul>
    );
  }
  return (
    <ul>
      <li>GNPS-MassIVE identifier: <a href={project.MaSSIVE_URL}>{project.GNPSMassIVE_ID}</a></li>
      <li>Molecular Network Task ID: {project.molecular_network}</li>
      <li>Publications: {data.publications}</li>
    </ul>
  );
}
