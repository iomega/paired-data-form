import { DATADIR, REDIS_URL, ZENODO_UPLOAD_ENABLED, ELASTICSEARCH_URL } from './util/secrets';
import { ProjectDocumentStore } from './projectdocumentstore';
import { buildEnrichQueue, scheduledZenodoUploads } from './tasks';

export const store = new ProjectDocumentStore(DATADIR, REDIS_URL, ELASTICSEARCH_URL);
export const enrichqueue = buildEnrichQueue(store);

if (ZENODO_UPLOAD_ENABLED) {
    scheduledZenodoUploads(store);
}
