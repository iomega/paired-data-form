# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.2] - 2021-03-03

## Added

- Allow notifications to be disabled with `SLACK_TOKEN=false` environment variable
- Mention CC BY 4.0 license on add and download page
- Health check API endpoint ([#171](https://github.com/iomega/paired-data-form/issues/171))

## Fixed

- URL in notification message is internal ([#168](https://github.com/iomega/paired-data-form/issues/168))
- Return 404 http error when path is not /api, a file or part of router paths ([#174](https://github.com/iomega/paired-data-form/issues/174))

## [0.9.1] - 2021-01-21

### Security

- Axios vulnerability ([CVE-2020-28168](https://github.com/advisories/GHSA-4w2v-q235-vp99))
- node-notifier vulnerability ([CVE-2020-7789](https://github.com/advisories/GHSA-5fw9-fq32-wv5p))

## [0.9.0] - 2020-12-07

### Added

- Notify admins on Slack when new project is ready for review ([#155](https://github.com/iomega/paired-data-form/issues/155))
- Notify admins on Slack when data archive on Zenodo is updated ([#163](https://github.com/iomega/paired-data-form/issues/163))

## [0.8.2] - 2020-11-05

### Fixed

- Use BioSample DB link to NCBI ([#162](https://github.com/iomega/paired-data-form/issues/162))

## [0.8.1] - 2020-09-28

### Added

- Links to methods page ([#159](https://github.com/iomega/paired-data-form/issues/159))

## [0.8.0] - 2020-09-22

### Added

- Column check for uploading of genome links ([#154](https://github.com/iomega/paired-data-form/pull/154))
- Methods page ([#158](https://github.com/iomega/paired-data-form/pull/158))

### Fixed

- Render publications delimited by spaces ([#152](https://github.com/iomega/paired-data-form/pull/152))

## [0.7.0] - 2020-07-10

### Added

- SEO optimizations like static sitemap, dynamic sitemap for projects and each project has structured data ([#148](https://github.com/iomega/paired-data-form/pull/148))

### Changed

- Titles synced with draft paper ([#146](https://github.com/iomega/paired-data-form/pull/146))

### Fixed

- Correct title for acetonitrile search example ([#141](https://github.com/iomega/paired-data-form/issues/141))
- Consistent casing of platform name ([#143](https://github.com/iomega/paired-data-form/issues/143))
- Smiles render with own optional scrollbar ([#147](https://github.com/iomega/paired-data-form/issues/147))

## [0.6.2] - 2020-04-23

### Added

- Paging projects ([#137](https://github.com/iomega/paired-data-form/issues/137))

### Changed

- Sort projects moved from web application to elastic search ([#138](https://github.com/iomega/paired-data-form/issues/138))
- Allow search and filter to be combined

## [0.6.1] - 2020-04-16

### Added

- Added ionization modes to stats page ([#132](https://github.com/iomega/paired-data-form/issues/132))
- Search query examples ([#132](https://github.com/iomega/paired-data-form/issues/132))

### Fixed

- Enrichments cause Limit of total fields exceeded error in elastic search ([#131](https://github.com/iomega/paired-data-form/issues/131))

## [0.6.0] - 2020-04-16

Search functionality using elastic search has been added.

### Added

- Full text search functionality ([#123](https://github.com/iomega/paired-data-form/issues/123))
- Filter projects on statistic functionality ([#124](https://github.com/iomega/paired-data-form/issues/124))

### Changed

- Replaced http with https ([#126](https://github.com/iomega/paired-data-form/issues/126))

### Fixed

- Schema version not constant ([#127](https://github.com/iomega/paired-data-form/issues/127))

## [0.5.0] - 2020-04-02

### Added

- Mention JSON schema on add form ([#115](https://github.com/iomega/paired-data-form/issues/115))
- Project list can be sorted by clicking on column header ([#117](https://github.com/iomega/paired-data-form/issues/117))
- Show software version on about page ([#109](https://github.com/iomega/paired-data-form/issues/109))
- Download page, shows DOI of dataset archive ([#109](https://github.com/iomega/paired-data-form/issues/109))

### Changed

- Project list sorted on metabolite id ([#117](https://github.com/iomega/paired-data-form/issues/117))

### Fixed

- Submitter email is used where PI email is expected ([#118](https://github.com/iomega/paired-data-form/issues/118))
- Download button on pending page yields incorrectly formatted json files ([#120](https://github.com/iomega/paired-data-form/issues/120))

## [0.4.0] - 2020-03-20

This version requires following migration steps.

- JSON schema changed to version 2. To migrate all projects in data/ dir from 1 to 2 run

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

- The enrichment of projects has been improved. To recreate enrichments of all projects run

  ```shell
  # Drop existing enrichment with
  docker-compose exec redis sh
  redis-cli --scan --pattern keyv:enrichment:* | xargs redis-cli del
  exit
  # Recreate all enrichments
  docker-compose exec api npm run enrich
  ```

### Added

- About page ([#86](https://github.com/iomega/paired-data-form/issues/86))
- Limit log size of Docker containers ([#89](https://github.com/iomega/paired-data-form/issues/89))
- Denied projects moved to thrash dir ([#95](https://github.com/iomega/paired-data-form/issues/95))
- Stats page ([#64](https://github.com/iomega/paired-data-form/issues/64))
- Fetch species from BioSample, ENA and JGI for each genome
- Download button for pending project in review section ([#98](https://github.com/iomega/paired-data-form/issues/98))
- Submitter name column to project lists ([#101](https://github.com/iomega/paired-data-form/issues/101))
- Commands to validate one or all projects ([#100](https://github.com/iomega/paired-data-form/issues/100))
- Command to perform data migrations ([#110](https://github.com/iomega/paired-data-form/pull/110))
- Second submitter ([#97](https://github.com/iomega/paired-data-form/issues/97))
- OpenAPI specification ([#112](https://github.com/iomega/paired-data-form/issues/112))
- Manual for developers who wish to consume the api

### Fixed

- Unable to submit large project ([#88](https://github.com/iomega/paired-data-form/issues/88))
- Spelling errors ([#87](https://github.com/iomega/paired-data-form/issues/87))
- Render error when growth medium is not set ([#92](https://github.com/iomega/paired-data-form/issues/92))
- Unable to download project from add form([#111](https://github.com/iomega/paired-data-form/issues/111))

### Changed

- Dropped Caddy web server from docker-compose, use nginx from app and external reverse proxy for https
- Download project directly using web service instead of data-url
- BGC number to BGC accession aka 1234 to BGC0001234 ([#94](https://github.com/iomega/paired-data-form/issues/94))
- Require more fields in Gene cluster - Mass spectra links ([#94](https://github.com/iomega/paired-data-form/issues/94))
- Increased JSON schema version to 2 due to issue #94

## [0.3.0] - 2019-12-11

### Added

- Confirmation of submission to review ([#74](https://github.com/iomega/paired-data-form/issues/74))
- Resins field to extraction method ([#76](https://github.com/iomega/paired-data-form/issues/76))
- erlemeyer flask option to aeration vessel ([#76](https://github.com/iomega/paired-data-form/issues/76))
- Links to description of fields and check list ([#76](https://github.com/iomega/paired-data-form/issues/76))
- Warning to not include spaces in urls ([#75](https://github.com/iomega/paired-data-form/issues/75))

### Fixed

- Do validation on labels when selected in links sections ([#73](https://github.com/iomega/paired-data-form/issues/73))
- Validate uploaded JSON documents ([#78](https://github.com/iomega/paired-data-form/issues/78))
- GNPS task id link broken ([#81](https://github.com/iomega/paired-data-form/issues/81))

## [0.2.0] - 2019-07-05

### Added

- Intro page ([#45](https://github.com/iomega/paired-data-form/issues/45))
- Password protected review section to review pending projects ([#45](https://github.com/iomega/paired-data-form/issues/45))
- Page with list of projects ([#45](https://github.com/iomega/paired-data-form/issues/45))
- Page to show single project ([#45](https://github.com/iomega/paired-data-form/issues/45))
- Web service to store project on disk as JSON documents ([#46](https://github.com/iomega/paired-data-form/issues/46))
- Task queue to enrich projects ([#46](https://github.com/iomega/paired-data-form/issues/46))
- Enrich project by fetching organism name based on genome identifier ([#46](https://github.com/iomega/paired-data-form/issues/46))

### Changed

- original form is now for adding a project for review ([#45](https://github.com/iomega/paired-data-form/issues/45))
- Added metabolights study id to genome ([#54](https://github.com/iomega/paired-data-form/issues/54))
- Made which fields are required more clear ([#42](https://github.com/iomega/paired-data-form/issues/42))
- Replaced run command from `yarn` to `docker-compose`

## [0.1.0] - 2019-05-01

Initial release.

[unreleased]: https://github.com/iomega/paired-data-form/compare/v0.9.2...HEAD
[0.9.2]: https://github.com/iomega/paired-data-form/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/iomega/paired-data-form/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/iomega/paired-data-form/compare/v0.8.2...v0.9.0
[0.8.2]: https://github.com/iomega/paired-data-form/compare/v0.8.1...v0.8.2
[0.8.1]: https://github.com/iomega/paired-data-form/compare/v0.8.0...v0.8.1
[0.8.0]: https://github.com/iomega/paired-data-form/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/iomega/paired-data-form/compare/v0.6.2...v0.7.0
[0.6.2]: https://github.com/iomega/paired-data-form/compare/v0.6.1...v0.6.2
[0.6.1]: https://github.com/iomega/paired-data-form/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/iomega/paired-data-form/compare/v0.5.9...v0.6.1
[0.5.0]: https://github.com/iomega/paired-data-form/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/iomega/paired-data-form/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/iomega/paired-data-form/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/iomega/paired-data-form/compare/v0.0.1...v0.2.0
[0.1.0]: https://github.com/iomega/paired-data-form/releases/tag/v0.1.0
