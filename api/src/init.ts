import dotenv from 'dotenv';

import { DATADIR, REDIS_URL } from './util/secrets';
import { ProjectDocumentStore } from './projectdocumentstore';
import { buildEnrichQueue } from './tasks';

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: '.env.example' });

export const store = new ProjectDocumentStore(DATADIR, REDIS_URL);
export const enrichqueue = buildEnrichQueue(store.enrichment_store);
