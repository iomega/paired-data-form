Web form for paired data for mapping between genomic and metabolomic (mass spectra) datasets.

The schema ([app/public/schema.json](app/public/schema.json)) describes the form.

[![Build Status](https://travis-ci.org/iomega/paired-data-form.svg?branch=master)](https://travis-ci.org/iomega/paired-data-form)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=iomega_paired-data-form&metric=alert_status)](https://sonarcloud.io/dashboard?id=iomega_paired-data-form)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=iomega_paired-data-form&metric=coverage)](https://sonarcloud.io/dashboard?id=iomega_paired-data-form)
[![DOI](https://zenodo.org/badge/155896083.svg)](https://zenodo.org/badge/latestdoi/155896083)


# Run using Docker compose

The application can be configured using environment variables:
* PORT, https port application is running on. Default is 8443.
* SHARED_TOKEN, token required to login to review area.
* DOMAIN, domain the service is listening for and domain for which certificates are made
* TLS_MODE, use email for proper cert when Internet facing. If not set uses self signed certificate, see https://caddyserver.com/docs/tls

```bash
docker-compose up --build
```

Starts application, api webservice and reverse proxy on https://<DOMAIN>:8443 .
Project JSON files are stored in a `./data/` directory.
