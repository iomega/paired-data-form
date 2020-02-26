# Paired omics data platform

Linking mas spectra and genomic information to discover new chemistry.

* Links MS/MS mass spectra with genome, sample preparation, extraction method and instrumentation method
* Links biosynthetic gene cluster with MS^2 mass spectra

A web application for storing paired omics data projects.

The [JSON schema (app/public/schema.json)](app/public/schema.json) describes the format of an project.

[![Build Status](https://travis-ci.org/iomega/paired-data-form.svg?branch=master)](https://travis-ci.org/iomega/paired-data-form)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=iomega_paired-data-form&metric=alert_status)](https://sonarcloud.io/dashboard?id=iomega_paired-data-form)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=iomega_paired-data-form&metric=coverage)](https://sonarcloud.io/dashboard?id=iomega_paired-data-form)
[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.3569588.svg)](https://doi.org/10.5281/zenodo.3569588)

## Architecture

The paired omics data platform consists of:

1. A Web application, user interface, see [app/](app/) folder
2. An API web service, service responsible for storing projects, see [api.](api/) folder

## Run using Docker compose

The application can be configured using environment variables:

* PORT, http port application is running on. Default is 8443.
* SHARED_TOKEN, token required to login to review area.

```shell
docker-compose up -d --build
```

Starts application, api webservice and reverse proxy on [http://localhost:8443](http://localhost:8443).
Project JSON files are stored in a `./data/` directory.

To run on production put application behind a reverse proxy web server with a proper domain and secure transfer with https.

## Rebuild

When schema has changed the documents in `./data/` directory need to be migrated.

```shell
# Login to api server
docker-compose exec api sh
# Perform migration
...
```

When the code has changed the Docker images has been rebuild and restarted with

```shell
docker-compose stop
docker-compose up -d --build
```

To enrich existing projects run

```shell
docker-compose exec api npm run enrich
```

## New release

To make a new release of the platform do:

1. Determine new version of release, using semantic versioning (x.y.z)
2. Add version to CHANGELOG.md
3. Set new version of api web service by

```shell
cd api
npm version x.y.z
```

4. Set new version of web application by

```shell
cd app
npm version x.y.z
```

5. Commit & push changes
6. Create a GitHub release
7. Update author list on https://doi.org/10.5281/zenodo.2656630
8. Update version & release date in CITATION.cff
