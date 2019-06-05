import path from 'path';

import Redis from 'ioredis';

import { ProjectEnrichments } from '../enrich';
import { REDIS_URL } from '../util/secrets';

export class ProjectEnrichmentStore {
    redis: Redis.Redis;

    constructor(redis_url = REDIS_URL) {
        this.redis = new Redis(redis_url);
    }

    async set(project_id: string, enrichment: ProjectEnrichments) {
        await this.redis.set(project_id, JSON.stringify(enrichment));
    }

    async get(project_id: string) {
        return JSON.parse(await this.redis.get(project_id));
    }
}
