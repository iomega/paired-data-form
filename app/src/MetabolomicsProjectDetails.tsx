import * as React from 'react';

import { MetabolomicsInformation } from './schema';
import { isMetaboLights } from './typeguards';
import { Publications } from './Publications';

interface IProps {
  data: MetabolomicsInformation;
}

export const MetabolomicsProjectDetails = ({ data }: IProps) => {
  const project = data.project;
  if (isMetaboLights(project)) {
    return (
      <ul>
        <li>Metabolights study identifier: <a href="https://www.ebi.ac.uk/metabolights/{repo.metabolights_study_id}">{project.metabolights_study_id}</a></li>
        <li>Publications: <Publications publications={data.publications!}/></li>
      </ul>
    );
  }
  return (
    <ul>
      <li>GNPS-MassIVE identifier: <a href={project.MaSSIVE_URL}>{project.GNPSMassIVE_ID}</a></li>
      <li>Molecular Network Task ID: <a href="http://gnps.ucsd.edu/ProteoSAFe/status.jsp?task={project.molecular_network}">{project.molecular_network}</a></li>
      <li>Publications: <Publications publications={data.publications!}/></li>
    </ul>
  );
}
