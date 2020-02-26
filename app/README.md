# Web application for paired data for mapping between genomic and metabolomic (mass spectra) projects.

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Some information on how to perform common tasks is available in the [guide](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).

## Install

Atfer cloning the repo, it's dependencies must be installed.

Requires [nodejs](https://nodejs.org) v10 or higher.

```shell
npm install
```

## Development

```shell
npm start
```

Runs the app in development mode. Open http://localhost:3000 to view it in the browser.

The page will automatically reload if you make changes to the code. You will see the build errors and lint warnings in the console.

## Deployment to Github pages

The https://iomega.github.io/paired-data-form site can be updated by running:

```shell
npm run deploy
```

## Docker

Build with

```shell
docker build -t iomega/paired-data-form app
```

Run with

```shell
docker run -d -p 8887:80 iomega/paired-data-form
```

Goto http://localhost:8887

## Propagate schema changes

When `public/schema.json` changes the `src/schema.ts` must also be updated using

```shell
npm run schema2ts
```
