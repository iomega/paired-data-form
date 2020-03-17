import yargs from 'yargs';

import { store } from './init';
import { enrichAllProjects } from './tasks';
import { Validator } from './validate';
import { migrate } from './migrate';

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
).command(
    'validate <file>',
    'Validate JSON file as a Paired Omics Data Platform project file',
    (args) => {
        return args
            .positional('file', {
                describe: 'file to validate',
                type: 'string'
            });
    },
    (argv) => {
        const validator = new Validator();
        const is_valid = validator.validateFile(argv.file);
        if (is_valid) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    }
).command(
    'migrate',
    'Migrate all approved and pending projects to current JSON schema version',
    (args) => (args),
    async () => {
        await store.initialize();
        await migrate(store);
        process.exit(0);
    }
).help().version().argv;
