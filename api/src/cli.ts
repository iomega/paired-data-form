import yargs from 'yargs';

import { store } from './init';
import { enrichAllProjects } from './tasks';
import { Validator } from './validate';
import { migrate } from './migrate';
import { publish2zenodo } from './util/publish2zenodo';

yargs.command(
    'enrich',
    'Enriches all non enriched projects',
    (args) => (args),
    () => {
        store.initialize()
            .then(() => {
                return enrichAllProjects(store);
            })
            .catch((e: any) => console.error(e))
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
    (argv: any) => {
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
).command(
    'publish2zenodo',
    'Publish all approved projects to Zenodo',
    (args) => {
        return args
            .option('access_token', {
                type: 'string',
                description: 'Zenodo access token. If not set then ZENODO_ACCESS_TOKEN env var is used.'
            })
            .option('deposition_id', {
                type: 'number',
                description: 'Zenodo deposition identifier. If not set then ZENODO_DEPOSITION_ID env var is used.'
            })
            .option('sandbox', {
                type: 'boolean',
                default: false,
                description: 'Publish to Zenodo sandbox (https://sandbox.zenodo.org) environment instead of Zenodo production environment'
            })
            ;
    },
    async (argv) => {
        await store.initialize();
        let api_base_url = 'https://zenodo.org/api';
        if (argv.sandbox) {
            api_base_url = 'https://sandbox.zenodo.org/api';
        }
        const doi = await publish2zenodo(store, argv.access_token, argv.deposition_id, api_base_url);
        console.log(`Generated new versioned DOI: ${doi}`);

        process.exit(0);
    }
).help().version().argv;
