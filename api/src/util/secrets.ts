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

export const SHARED_TOKEN = process.env['SHARED_TOKEN'];

if (!SHARED_TOKEN) {
    logger.error('No client secret. Set SHARED_TOKEN environment variable.');
    process.exit(1);
}

export const DATADIR = process.env['DATADIR'];
if (!DATADIR) {
    logger.error('No data directory. Set DATADIR environment variable.');
    process.exit(1);
}

export const REDIS_URL = process.env['REDIS_URL'];
if (!REDIS_URL) {
    logger.error('No redis url. Set REDIS_URL environment variable.');
    process.exit(1);
}
