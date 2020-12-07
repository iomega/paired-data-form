import logger from './logger';
import dotenv from 'dotenv';
import fs from 'fs';

if (fs.existsSync('.env')) {
    logger.debug('Using .env file to supply config environment variables');
    dotenv.config({ path: '.env' });
} else {
    logger.debug('Using .env.example file to supply config environment variables');
    dotenv.config({ path: '.env.example' });  // you can delete this after you create your own .env file!
}
export const ENVIRONMENT = process.env.NODE_ENV;

function getenvvar(name: string, error: string) {
    const value = process.env[name];
    if (!value) {
        logger.error(`${error}. Set ${name} environment variable.`);
        process.exit(1);
    }
    return value;
}

export const SHARED_TOKEN = getenvvar('SHARED_TOKEN', 'No client secret');
if (SHARED_TOKEN === 'ashdfjhasdlkjfhalksdjhflak' && ENVIRONMENT === 'production') {
    logger.error('Do not use default shared token in production');
    process.exit(1);
}
export const DATADIR = getenvvar('DATADIR', 'No data directory');
export const REDIS_URL = getenvvar('REDIS_URL', 'No redis url');
export const ELASTICSEARCH_URL = getenvvar('ELASTICSEARCH_URL', 'No elastic search url');
export const ZENODO_ACCESS_TOKEN = getenvvar('ZENODO_ACCESS_TOKEN', 'No Zenodo access token');
export const ZENODO_DEPOSITION_ID = parseInt(getenvvar('ZENODO_DEPOSITION_ID', 'No Zenodo deposition id'));
export const ZENODO_UPLOAD_ENABLED = ZENODO_DEPOSITION_ID !== -1;
export const SLACK_TOKEN = getenvvar('SLACK_TOKEN', 'No Slack token');
export const SLACK_CHANNEL = getenvvar('SLACK_CHANNEL', 'No Slack channel for notifications');
