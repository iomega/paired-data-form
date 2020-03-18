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
