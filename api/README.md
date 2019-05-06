# Api web service for paired omics data platform

## Install

```bash
npm install
```

## Configure

Create `.env` file. 
Use `.env.example` as example.

## Run

```bash
npm run build && npm run serve
```

## Interact

Using [httpie](https://httpie.org)
```bash
http localhost:3000/api/pending/projects 'Authorization: Bearer ashdfjhasdlkjfhalksdjhflak'
http localhost:3000/api/projects
http -j -p HBhb localhost:3000/api/projects < ../public/examples/paired_datarecord_MSV000078839_example.json 
```