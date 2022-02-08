# Api web service for Pairing Omics Data Platform

## Architecture

The Pairing Omics Data Platform api web service use a directories to store project json files.

* pending/, any projects added via POST to `/api/projects` or `/api/projects/:id` will end up here. Ready for reviewing
* approved/, all public visible projects. Once a project is approved it is moved from the `pending/` directory to the `approved/` directory.
* archive/, when an existing project has been edited and approve, the previously approved project file is moved here.
* thrash/, when an pending project has been denied it is moved from the `pending/` directory to the `thrash/` directory.

Extra information is gathered for some of the identifiers and urls in a project json files. This extra information is called an enrichment. [Redis](https://redis.io/) is used to store enrichments and as job queue.

[Elastic search](https://www.elastic.co/elasticsearch/) is used to perform full text search and filtering of projects.

Consumption of the web service is explained in the [developers manual](../manuals/developers.md).

## Install

```shell
npm install
```

## Configure

Create `./.env` file, use `./.env.example` as an example.

### Zenodo access token

To publish the data collection to Zenodo, a [Zenodo personal access token](https://zenodo.org/account/settings/applications/tokens/new/) is needed.
During token generation check the `deposit:actions` and `deposit:write` scopes.

### Slack integration

The service can post messages to a Slack channel when a project is submitted or pushed to Zenodo.

1. [Create an Slack app](https://api.slack.com/apps), pick any name / workspace you want
1. Optionally. Add collaborators so your are not the only one who can edit the Slack app
1. Add `chat:write` to bot token scopes
1. Install to workspace and allow bot to write chats
1. Copy token to `../.env:SLACK_TOKEN` value
1. Create channel to post messages to and set it's id (last bit of channel url) as `../.env:SLACK_CHANNEL` value
1. In channel select `Add an app` and add the created app

People that should be reviewing incoming projects should be invited to the Slack channel and be supplied with the review credentials.

## Build & Run

Redis can be started using docker:

```shell
docker run --name some-redis -d -p 6379:6379 redis:alpine
```

Or using [docker-compose](../README.md#run-using-docker-compose) to run the whole stack.

Elastic search can be started using docker:

```shell
docker run --name some-elasticsearch -d -p 9200:9200 -e "discovery.type=single-node" elasticsearch:7.17.0
```

Or using [docker-compose](../README.md#run-using-docker-compose) to run the whole stack.

Build with

```shell
npm run build
```

Run web service

```bash
npm run serve
```

## Docker

Build with

```shell
cd ..
docker build -t iomega/podp-api -f api/Dockerfile .
```

Run using `./data` dir as datadir with

```shell
docker run -d -p 8886:3001 --user $(id -u) -v $PWD/data:/data iomega/podp-api
```

Will start api web service on [http://localhost:8886](http://localhost:8886).

## Propagate schema changes

When `../app/public/schema.json` changes the `src/schema.ts` must also be updated using

```shell
npm run schema2ts
```

## Propagate api changes

When the api changes the OpenAPI specification at [../app/public/openapi.yaml](../app/public/openapi.yaml) should also be updated. Changes to schema (`../app/public/schema.json`) do not require updates to the OpenAPI spec as it is imported into the spec.

## Schema migration and validation

Whenever the schema is changed the projects in the data/ directory must be migrated and validated.

The projects can be validated with

```shell
npm run validateall
```

## Publish collection on Zenodo

The approved projects can be published to Zendo by running

```shell
npm run publish2zenodo -- --sandbox --deposition_id xxxx --access_token xxxxxxxxxxxxx
```

Or when running with docker-composose in production use

```shell
docker-compose exec api npm run publish2zenodo
```

## Tests

The unit tests can be run with

```shell
npm run test
```
