import yargs from 'yargs';

import { store } from './init';
import { enrichAllProjects } from "./tasks";

yargs.command(
    'enrich', 
    'Enriches all non enriched projects', 
    (args) => (args), 
    () => {
        enrichAllProjects(store).then(() => process.exit());
    }
).help().version().argv;
