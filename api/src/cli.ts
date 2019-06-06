import yargs from 'yargs';

import { store } from './init';
import { enrichAllProjects } from './tasks';

yargs.command(
    'enrich',
    'Enriches all non enriched projects',
    (args) => (args),
    () => {
        store.initialize()
            .then(() => {
                return enrichAllProjects(store);
            })
            .catch(e => console.error(e))
            .then(() => {
                console.log('Done');
                // Bull and Keyv have open promises which cause node to not exit voluntary
                process.exit(0);
            })
        ;
    }
).help().version().argv;
