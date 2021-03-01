import { DataCatalog } from "schema-dts";

export const doi = '10.5281/zenodo.3736430';
export const doiLink = 'https://doi.org/' + doi;

export const jsonldDataCatalog: DataCatalog = {
  "@type": "DataCatalog",
  name: "Paired Omics Data Platform",
  about: 'Linking mas spectra and genomic information to discover new chemistry',
  url: 'https://pairedomicsdata.bioinformatics.nl',
  identifier: doiLink,
  publication: {
    "@type":  "PublicationEvent",
    name: "A community resource for paired genomic and metabolomic data mining",
    url: "https://www.nature.com/articles/s41589-020-00724-z"
  },
  license: 'https://creativecommons.org/licenses/by/4.0/legalcode',
};
