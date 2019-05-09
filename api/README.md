# Api web service for paired omics data platform

## Install

```bash
npm install
```

## Configure

Create `.env` file. 
Use `.env.example` as example.

## Build & Run

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
