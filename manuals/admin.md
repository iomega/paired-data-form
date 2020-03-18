# Manual for platform administrators

## Reviewing

When a project has been submitted it has to be reviewed and either be approved or denied.

To review a project

1. Goto [http://pairedomicsdata.bioinformatics.nl/pending](http://pairedomicsdata.bioinformatics.nl/pending) for the list of pending projects
1. Login with supplied password if not already logged in
1. Perform review by either
    1. Clicking on the `Metabolomics project identifier` to see the project rendered as if it was public.
    2. Download the JSON file and look at it offline
1. Click the Approve/Deny button
    1. Clicking `Approve` button will immediately make the project public for everyone
    2. Clicking `Deny` button will immediately move the project to the recycle-bin

The recycle-bin is the `data/thrash/` directory on the server.

## Deployment

Tasks for the person deploying platform.

### Schema change

When schema has changed the documents in `./data/` directory need to be migrated.

```shell
# Create a backup before starting migration
cp -a data/ backup-$(date -I)/
# Perform migration
docker-compose exec api npm run migrate
# Validate projects
docker-compose exec api npm run validateall
# Fix any validation errors by editing the project files and rerun validation until all projects are valid
```

### Rebuild

When the code has changed the Docker images have to be rebuild and restarted with

```shell
docker-compose stop
docker-compose up -d --build
```

### Enrich

Normally all submitted projects are enriched with for the species scientific name and other things.
Those enrichments are stored in the Redis database.
It can happen that, for example when enrichment code is improved, the Redis database does not have enrichments for a project.

To enrich existing projects run

```shell
docker-compose exec api npm run enrich
```
