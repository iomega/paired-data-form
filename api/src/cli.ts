import yargs from 'yargs';

import { store } from './init';
import { enrichAllProjects } from "./tasks";

yargs.command(
    'enrich', 
    'Enriches all non enriched projects', 
    (args) => (args), 
    () => {
        store.initialize().then(() => {
            enrichAllProjects(store);
        }).catch(e => console.error(e)).then(() => process.exit());
    }
).help().version().argv;
