import { MetaboLights, GNPSMassIVE } from './schema';

export function isMetaboLights(project: GNPSMassIVE | MetaboLights): project is MetaboLights {
  return ((project as MetaboLights).metabolights_study_id !== undefined);
}
