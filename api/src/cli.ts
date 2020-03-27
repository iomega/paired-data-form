import yargs from 'yargs';

import { store } from './init';
import { enrichAllProjects } from './tasks';
import { Validator } from './validate';
import { migrate } from './migrate';
import { publish2zenodo } from './util/publish2zenodo';
import { ZENODO_ACCESS_TOKEN, ZENODO_DEPOSITION_ID } from './util/secrets';
import { DraftDiscardedError } from '@iomeg/zenodo-upload';

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
            .option('checksum', {
                type: 'boolean',
                default: true,
                description: 'Only create new Zenodo version when checksum of file is different'
            })
            ;
    },
    async (argv) => {
        await store.initialize();
        let access_token = argv.access_token;
        if (!access_token) {
            access_token = ZENODO_ACCESS_TOKEN;
        }
        let deposition_id = argv.deposition_id;
        if (!deposition_id) {
            deposition_id = ZENODO_DEPOSITION_ID;
        }

        try {
            const result = await publish2zenodo(
                store,
                argv.access_token,
                argv.deposition_id,
                argv.sandbox,
                argv.checksum
            );
            console.log(`Generated new versioned DOI: ${result.doi}, can take a while to be found`);
            console.log(`Generated new Zenodo upload: ${result.html}`);
            process.exit(0);
        } catch (error) {
            if (error instanceof DraftDiscardedError) {
                console.log('Publish discarded, due to unchanged projects');
                process.exit(1);
            }
            throw error;
        }
    }
).help().version().argv;
