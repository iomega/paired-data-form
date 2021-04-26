import { ProjectDocumentStore } from './projectdocumentstore';

export interface Migration {
    applicable(p: any): boolean;
    up(p: any): any;
}

export const migrations: Migration[] = [
    {
        applicable: (p: any) => p.version === '1',
        up: (project: any) => {
            // bump version
            project.version = '2';

            // MIBiG accession instead of number
            if (project.BGC_MS2_links) {

                function bgc2string(value: string | number) {
                    if (value.toString().startsWith('BGC')) {
                        return value;
                    }
                    return 'BGC' + value.toString().padStart(7, '0');
                }

                project.BGC_MS2_links.forEach((r: any) => {
                    if (r.BGC_ID.BGC === 'MIBiG number associated with this exact BGC') {
                        r.BGC_ID.MIBiG_number = bgc2string(r.BGC_ID.MIBiG_number);
                        delete r.BGC_ID.similar_MIBiG_number;
                    } else {
                        r.BGC_ID.similar_MIBiG_number = bgc2string(r.BGC_ID.similar_MIBiG_number);
                        delete r.BGC_ID.MIBiG_number;
                    }
                });
            }

            return project;
        }
    },
    {
        applicable: (p: any) => p.version === '2',
        up: (project: any) => {
            // bump version
            project.version = '3';

            // column HILIC renamed to `Hydrophilic interaction (HILIC)`
            if (project.experimental.instrumentation_methods) {
                project.experimental.instrumentation_methods.forEach((r: any) => {
                    if (r.column === 'HILIC') {
                        r.column = 'Hydrophilic interaction (HILIC)';
                    }
                });
            }

            // Proteomes added
            if (!project.proteomes) {
                project.proteomes = [];
            }

            // quantitative_experiment added
            if (project.BGC_MS2_links) {
                project.BGC_MS2_links.forEach((r: any) => {
                    if (!r.quantitative_experiment) {
                        r.quantitative_experiment = {
                            quantitative_experiment_type: 'Not available'
                        };
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
        let migrated = false;
        for (const m of migrations) {
            if (m.applicable(p.project)) {
                console.log(`Project ${p._id} v${p.project.version}`);
                p.project = m.up(p.project);
                p.project = m.up(p.project);
                migrated = true;
            }
        }
        if (migrated) {
            await store.disk_store.writePendingProject(p._id, p.project);
        }
    }
    console.log('Migrating approved projects');
    const projects = await store.listProjects();
    for (const p of projects) {
        let migrated = false;
        for (const m of migrations) {
            if (m.applicable(p.project)) {
                console.log(`Project ${p._id} v${p.project.version}`);
                p.project = m.up(p.project);
                migrated = true;
            }
        }
        if (migrated) {
            await store.disk_store.writePendingProject(p._id, p.project);
            await store.disk_store.approveProject(p._id);
        }
    }
};
