# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Mention JSON schema on add form ([#115](https://github.com/iomega/paired-data-form/issues/115))

### Fixed

* Submitter email is used where PI email is expected ([#118](https://github.com/iomega/paired-data-form/issues/118))
* Download button on pending page yields incorrectly formatted json files ([#120](https://github.com/iomega/paired-data-form/issues/120))

## [0.4.0] - 2020-03-20

This version requires following migration steps.

* JSON schema changed to version 2. To migrate all projects in data/ dir from 1 to 2 run

    ```shell
    # Backup
    cp -a data/ backup-$(date -I)/
    # Perform migration
    docker-compose exec api npm run migrate
    # Validate projects
    docker-compose exec api npm run validateall
    # Fix any validation errors and rerun validation until all projects are valid
    # For example use VS Code extension https://marketplace.visualstudio.com/items?itemName=tiibun.vscode-docker-ws to edit file in Docker container 
    # Edit CTRL-SHIFT-p, select dockerws command, select`paired-data-form_api_1` as Docker container and `/data` as path to open.
    code .
    # Restart api so new updated files are reindexed
    docker-compose restart api
    ```

* The enrichment of projects has been improved. To recreate enrichments of all projects run

    ```shell
    # Drop existing enrichment with
    docker-compose exec redis sh
    redis-cli --scan --pattern keyv:enrichment:* | xargs redis-cli del
    exit
    # Recreate all enrichments
    docker-compose exec api npm run enrich
    ```

### Added

* About page ([#86](https://github.com/iomega/paired-data-form/issues/86))
* Limit log size of Docker containers ([#89](https://github.com/iomega/paired-data-form/issues/89))
* Denied projects moved to thrash dir ([#95](https://github.com/iomega/paired-data-form/issues/95))
* Stats page ([#64](https://github.com/iomega/paired-data-form/issues/64))
* Fetch species from BioSample, ENA and JGI for each genome
* Download button for pending project in review section ([#98](https://github.com/iomega/paired-data-form/issues/98))
* Submitter name column to project lists ([#101](https://github.com/iomega/paired-data-form/issues/101))
* Commands to validate one or all projects ([#100](https://github.com/iomega/paired-data-form/issues/100))
* Command to perform data migrations ([#110](https://github.com/iomega/paired-data-form/pull/110))
* Second submitter ([#97](https://github.com/iomega/paired-data-form/issues/97))
* OpenAPI specification ([#112](https://github.com/iomega/paired-data-form/issues/112))
* Manual for developers who wish to consume the api

### Fixed

* Unable to submit large project ([#88](https://github.com/iomega/paired-data-form/issues/88))
* Spelling errors ([#87](https://github.com/iomega/paired-data-form/issues/87))
* Render error when growth medium is not set ([#92](https://github.com/iomega/paired-data-form/issues/92))
* Unable to download project from add form([#111](https://github.com/iomega/paired-data-form/issues/111))

### Changed

* Dropped Caddy web server from docker-compose, use nginx from app and external reverse proxy for https
* Download project directly using web service instead of data-url
* BGC number to BGC accession aka 1234 to BGC0001234 ([#94](https://github.com/iomega/paired-data-form/issues/94))
* Require more fields in Gene cluster - Mass spectra links ([#94](https://github.com/iomega/paired-data-form/issues/94))
* Increased JSON schema version to 2 due to issue #94

## [0.3.0] - 2019-12-11

### Added

* Confirmation of submission to review ([#74](https://github.com/iomega/paired-data-form/issues/74))
* Resins field to extraction method ([#76](https://github.com/iomega/paired-data-form/issues/76))
* erlemeyer flask option to aeration vessel ([#76](https://github.com/iomega/paired-data-form/issues/76))
* Links to description of fields and check list ([#76](https://github.com/iomega/paired-data-form/issues/76))
* Warning to not include spaces in urls ([#75](https://github.com/iomega/paired-data-form/issues/75))

### Fixed

* Do validation on labels when selected in links sections ([#73](https://github.com/iomega/paired-data-form/issues/73))
* Validate uploaded JSON documents ([#78](https://github.com/iomega/paired-data-form/issues/78))
* GNPS task id link broken ([#81](https://github.com/iomega/paired-data-form/issues/81))

## [0.2.0] - 2019-07-05

### Added

* Intro page ([#45](https://github.com/iomega/paired-data-form/issues/45))
* Password protected review section to review pending projects ([#45](https://github.com/iomega/paired-data-form/issues/45))
* Page with list of projects ([#45](https://github.com/iomega/paired-data-form/issues/45))
* Page to show single project ([#45](https://github.com/iomega/paired-data-form/issues/45))
* Web service to store project on disk as JSON documents ([#46](https://github.com/iomega/paired-data-form/issues/46))
* Task queue to enrich projects ([#46](https://github.com/iomega/paired-data-form/issues/46))
* Enrich project by fetching organism name based on genome identifier ([#46](https://github.com/iomega/paired-data-form/issues/46))

### Changed

* original form is now for adding a project for review ([#45](https://github.com/iomega/paired-data-form/issues/45))
* Added metabolights study id to genome ([#54](https://github.com/iomega/paired-data-form/issues/54))
* Made which fields are required more clear ([#42](https://github.com/iomega/paired-data-form/issues/42))
* Replaced run command from `yarn` to `docker-compose`

## [0.1.0] - 2019-05-01

Initial release.
