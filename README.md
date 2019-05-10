Web form for paired data for mapping between genomic and metabolomic (mass spectra) datasets.

The schema ([app/public/schema.json](app/public/schema.json)) describes the form.

[![Build Status](https://travis-ci.org/iomega/paired-data-form.svg?branch=master)](https://travis-ci.org/iomega/paired-data-form)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=iomega_paired-data-form&metric=alert_status)](https://sonarcloud.io/dashboard?id=iomega_paired-data-form)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=iomega_paired-data-form&metric=coverage)](https://sonarcloud.io/dashboard?id=iomega_paired-data-form)
[![DOI](https://zenodo.org/badge/155896083.svg)](https://zenodo.org/badge/latestdoi/155896083)


# Run using Docker compose

The application can be configured using environment variables:
* PORT, http port application is running on. Default is 3000.
* SHARED_TOKEN, token required to login to review area.

```bash
docker-compose up --build
```

Starts application and api webservice on http://localhost:3000
Project JSON files are stored in a `./data/` directory.
