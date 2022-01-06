# System operators

The manual for system operators who must keep the application running.

## Installation

## Configuration and running

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
