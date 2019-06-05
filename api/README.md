# Api web service for paired omics data platform

## Architecture

The paired omics data platform api web service use a directories to store project json files.

* pending/, any projects added via POST to `/api/projects` or `/api/projects/:id` will end up here. Ready for reviewing
* approved/, all public visible projects. Once a project is approved it is moved from the `pending/` directory to the `approved/` directory.
* archive/, when an existing project has been edited and approve, the previously approved project file is moved here.

## Install

```bash
npm install
```
## Configure

Create `.env` file. 
Use `.env.example` as example.

## Build & Run

The web service uses Redis as a cache for enrichments and job queue.
It can be started using docker or using docker-compose to run the whole stack.
```
docker run --name some-redis -d -p 6379:6379 redis
```

```bash
npm run build && npm run serve
```

## Interact

Using [httpie](https://httpie.org)
```bash
http localhost:3001/api/pending/projects 'Authorization: Bearer ashdfjhasdlkjfhalksdjhflak'
http localhost:3001/api/projects
http -j -p HBhb localhost:3001/api/projects < ../app/public/examples/paired_datarecord_MSV000078839_example.json
```

## Docker

Build with
```bash
cd ..
docker build -t iomega/podp-api -f api/Dockerfile .
```

Run using `./data` dir as datadir with
```bash
docker run -d -p 8886:3001 --user $(id -u) -v $PWD/data:/data iomega/podp-api
```
Will start api web service on http://localhost:8887

# Propagate schema changes

When `../app/public/schema.json` changes the `src/schema.ts` must also be updated using

```bash
npm run schema2ts
```
