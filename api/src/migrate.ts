import { Validator } from './validate';
import { IOMEGAPairedDataPlatform } from './schema';
import { ProjectDocumentStore } from './projectdocumentstore';

const validator = new Validator();
const schemaVersion = (validator.schema as any).properties.version.default;

export interface Migration {
    applicable(p: any): boolean;
    up(p: any): IOMEGAPairedDataPlatform;
}

export const migrations: Migration[] = [
    {
        applicable: (p: any) => p.version === '1' && schemaVersion === '2',
        up: (project: any) => {
            // bump version
            project.version = '2';

            // MIBiG accession instead of number
            if (project.BGC_MS2_links) {
                project.BGC_MS2_links.forEach((r: any) => {
                    if (r.BGC_ID.BGC === 'MIBiG number associated with this exact BGC') {
                        r.BGC_ID.MIBiG_number = 'BGC' + r.BGC_ID.MIBiG_number.toString().padStart(7, '0');
                    } else {
                        r.BGC_ID.similar_MIBiG_number = 'BGC' + r.BGC_ID.similar_MIBiG_number.toString().padStart(7, '0');
                    }
                });
            }

            return project;
        }
    }
];

export const migrate = async (store: ProjectDocumentStore) => {
    console.log('Migrating pending projects');
    const pending_projects = await store.listPendingProjects();
    for (const p of pending_projects) {
        for (const m of migrations) {
            if (m.applicable(p.project)) {
                console.log(`Project ${p._id}`);
                const new_project = m.up(p.project);
                await store.disk_store.writePendingProject(p._id, new_project);
            }
        }
    }
    console.log('Migrating approved projects');
    const projects = await store.listProjects();
    for (const p of projects) {
        for (const m of migrations) {
            if (m.applicable(p.project)) {
                console.log(`Project ${p._id}`);
                const new_project = m.up(p.project);
                await store.disk_store.writePendingProject(p._id, new_project);
                await store.disk_store.approveProject(p._id);
            }
        }
    }
};