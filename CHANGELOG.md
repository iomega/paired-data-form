# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

This version requires following migration steps.

The enrichment of projects has been improved. To recreate enrichments of all projects run

```shell
# Drop existing enrichment with
docker-compose exec redis bash
redis-cli --scan --pattern keyv:enrichment:* | xargs redis-cli del
exit
# Recreate all enrichments
docker-compose exec app npm run enrich
```

### Added

* About page ([#86](https://github.com/iomega/paired-data-form/issues/86))
* Limit log size of Docker containers ([#89](https://github.com/iomega/paired-data-form/issues/89))
* Denied projects moved to thrash dir ([#95](https://github.com/iomega/paired-data-form/issues/95))
* Stats page ([#64](https://github.com/iomega/paired-data-form/issues/64))
* Fetch species from BioSample, ENA and JGI for each genome
* Download button for pending project in review section ([#98](https://github.com/iomega/paired-data-form/issues/98))
* Submitter name column to project lists ([#101](https://github.com/iomega/paired-data-form/issues/101))

### Fixed

* Unable to submit large project ([#88](https://github.com/iomega/paired-data-form/issues/88))
* Spelling errors ([#87](https://github.com/iomega/paired-data-form/issues/87))
* Render error when growth medium is not set ([#92](https://github.com/iomega/paired-data-form/issues/92))

### Changed

* Dropped Caddy web server from docker-compose, use nginx from app and external reverse proxy for https
* Download project directly using web service instead of data-url

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
