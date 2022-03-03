# System operators

The manual for system operators who must keep the application running.

## Installation

See READMEs

## Configuration and running

See READMEs

## Healthcheck

### User interface

To check that the application is working correctly visit the external URL like [https://pairedomicsdata.bioinformatics.nl/](https://pairedomicsdata.bioinformatics.nl/).

1. Should see a welcome page. This checks that the reverse proxy and React app Docker container are running OK.
2. Go to list page ([https://pairedomicsdata.bioinformatics.nl/projects](https://pairedomicsdata.bioinformatics.nl/projects)). Should see a list of projects. This checks that the API Docker container is running OK.
3. Perform a example search query like `Streptomyces`. Should see fewer projects. This checks that the Elastich search Docker container is running OK.

### API

Visit [https://pairedomicsdata.bioinformatics.nl/api/health](https://pairedomicsdata.bioinformatics.nl/api/health) to check the health of the api web service.

It should produce a JSON document like

```json
{
  "status": "pass",
  "checks": {
    "app": {
      "status": "pass"
    },
    "api": {
      "status": "pass"
    },
    "elasticsearch": {
      "status": "pass"
    },
    "redis": {
      "status": "pass"
    },
    "disk": {
      "status": "pass"
    }
  }
}
```

If any of the statuses is not equal to `pass` then check if all Docker container are up and running.

### Docker compose

The application should have 4 Docker containers running which can be checked by going to the directory with the `docker-compose.yml` file and running

```shell
docker-compose ps
```

It should output something like

```shell
          Name                        Command               State                  Ports
--------------------------------------------------------------------------------------------------------
pairedomicsdata_api_1      docker-entrypoint.sh /bin/ ...   Up      3001/tcp
pairedomicsdata_app_1      /docker-entrypoint.sh ngin ...   Up      0.0.0.0:8443->80/tcp,:::8443->80/tcp
pairedomicsdata_redis_1    docker-entrypoint.sh redis ...   Up      6379/tcp
pairedomicsdata_search_1   /bin/tini -- /usr/local/bi ...   Up      9200/tcp, 9300/tcp
```

The correct running the state for each container is `Up`.

## Full directory

The application does not like it when the disk on which the Docker volumes are mounted is full.
It will cause the Docker container to exit and make the application unresponsive.

To fix the disk should have enough room and the application should be stopped (`docker-compose down`) and started (`docker-compose up -d`).

## Running multiple instances

Each instance should run in its own cloned repository directory and with its own mount volumes.
Each instance should use its own code, network by using a unique [project name](https://docs.docker.com/compose/reference/envvars/#compose_project_name) like `pdop-staging` shown in commands below.

Build with

```shell
COMPOSE_PROJECT_NAME=pdop-staging docker-compose build
```

Start with

```shell
COMPOSE_PROJECT_NAME=pdop-staging docker-compose up -d
```

Stop with

```shell
COMPOSE_PROJECT_NAME=pdop-staging docker-compose down
```

The `COMPOSE_PROJECT_NAME` environment variable can also be added to the `.env` file.

## Security vulnerablities

When you have push rights on the [repo](https://github.com/iomega/paired-data-form) you will get [dependabot security alerts](https://github.com/iomega/paired-data-form/security/dependabot) at some point.

The dependabot will also create [pull requests](https://github.com/iomega/paired-data-form/pulls/app%2Fdependabot) to bump dependencies to the latest version. Upgrading to the latest version is only required when there is a vulnerability in the current version.

### Determine location of vulnerable libary

The dependabot alert will tell you if library is in app/ or api/ dir.

The amount of harm a vulnerabilty in a library can cause depends where the library is used.
A library which is

1. a non-dev dependency of api web service -> should be taken seriously as it could open server up for misuse
1. a non-dev dependency of app -> can be serious if library can misuse users browser. Due to mostly anonymous read operations of app most vulnerabilities will not be very serious
1. a dev dependency of api web service or app -> Mostly false positives (See [CRA npm audit issue](https://github.com/facebook/create-react-app/issues/11174)). Watch out for exploits that inject malicious code into the server or client code.

In app or api directory run `npm list <library>` to find out the direct dependency.
In `package.json` check if the direct dependency in `devDependencies` or `dependencies` object.

### Remediation

If you think the risk is tolerable, for example because it's a dependency of a dev dependency then you can dismiss the [dependabot security alerts](https://github.com/iomega/paired-data-form/security/dependabot).

To fix follow instructions in dependabot alert and test locally if install, build, test and running the platform still works.

### Remediation of remediation

Sometimes upgrading (or in rare cases downgrading) a dependency will break the app, api itself or their other dependencies.

Before upgrade check if it is OK to do so:

1. Find out what the old version and new version are by diffing package-lock.json
2. Go to libraries CHANGELOG
3. Look for breaking changes
4. Determine how much work it can be by locating its usage in the code
5. Implement migration instructions

Other options

* Merge green PR created by the dependabot bot
* Add pinned version of dependency of dependency
* Typescript errors can sometimes be fixed by
  * changing the version of `@types/<library>` dev dependency.
  * adding `@types/<library>` as dev dependency if it is missing
* Replace library with library that does some thing but with less vulnerabilties
