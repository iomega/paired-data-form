# Api web service for paired omics data platform

## Architecture

The paired omics data platform api web service use a directories to store project json files.

* pending/, any projects added via POST to `/api/projects` or `/api/projects/:id` will end up here. Ready for reviewing
* approved/, all public visible projects. Once a project is approved it is moved from the `pending/` directory to the `approved/` directory.
* archive/, when an existing project has been edited and approve, the previously approved project file is moved here.
* thrash/, when an pending project has been denied it is moved from the `pending/` directory to the `thrash/` directory.

Extra information is gathered for some of the identifiers and urls in a project json files. This extra information is called an enrichment. Redis is used to store enrichments and as job queue.

## Install

```shell
npm install
```

## Configure

Create `.env` file.
Use `.env.example` as example.

## Build & Run

Redis can be started using docker or using docker-compose to run the whole stack.

```shell
docker run --name some-redis -d -p 6379:6379 redis
```

Build with

```shell
npm run build
```

Run web service

```bash
npm run serve
```

The enrichments can be recreated by running

```shell
npm run enrich
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

Will start api web service on http://localhost:8887

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
