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
            project.BGC_MS2_links.forEach((r: any) => {
                if (r.BGC_ID.BGC === 'MIBiG number associated with this exact BGC') {
                    r.BGC_ID.MIBiG_number = 'BGC' + r.BGC_ID.MIBiG_number.toString().padStart(7, '0');
                } else {
                    r.BGC_ID.similar_MIBiG_number = 'BGC' + r.BGC_ID.similar_MIBiG_number.toString().padStart(7, '0');
                }
            });

            return project;
        }
    }
];

export const migrate = async (store: ProjectDocumentStore) => {
    console.log('Migrating pending projects');
    (await store.listPendingProjects()).forEach((p) => {
        migrations.filter(m => m.applicable(p.project)).forEach((m) => {
            console.log(`Project ${p._id}`);
            const new_project = m.up(p.project);
            store.disk_store.writePendingProject(p._id, new_project);
        });
    });
    console.log('Migrating approved projects');
    (await store.listProjects()).forEach((p) => {
        migrations.filter(m => m.applicable(p.project)).forEach((m) => {
            console.log(`Project ${p._id}`);
            const new_project = m.up(p.project);
            store.disk_store.writePendingProject(p._id, new_project);
            store.disk_store.approveProject(p._id);
        });
    });
};