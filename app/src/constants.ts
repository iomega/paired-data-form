import {
  CreativeWork,
  DataCatalog,
  PropertyValueSpecification,
  SearchAction,
  WebSite
} from "schema-dts";

export const doi = "10.5281/zenodo.3736430";
export const doiLink = "https://doi.org/" + doi;

type MySearchAction = SearchAction & {
  "query-input": PropertyValueSpecification | string;
};
const potentialAction: MySearchAction = {
  "@type": "SearchAction",
  target:
    "https://pairedomicsdata.bioinformatics.nl/projects?q={search_term_string}",
  "query-input": "required name=search_term_string"
};

export const jsonldWebsite: WebSite = {
  "@type": "WebSite",
  url: "https://pairedomicsdata.bioinformatics.nl",
  potentialAction
};

export type DctDataCatalog = DataCatalog & {
  "http://purl.org/dc/terms/conformsTo": CreativeWork;
};

export const jsonldDataCatalog: DctDataCatalog = {
  "@type": "DataCatalog",
  name: "Paired Omics Data Platform",
  description:
    "Linking mas spectra and genomic information to discover new chemistry",
  url: "https://pairedomicsdata.bioinformatics.nl",
  identifier: doiLink,
  publication: {
    "@type": "PublicationEvent",
    name: "A community resource for paired genomic and metabolomic data mining",
    url: "https://www.nature.com/articles/s41589-020-00724-z"
  },
  license: "https://creativecommons.org/licenses/by/4.0/legalcode",
  "http://purl.org/dc/terms/conformsTo": {
    "@type": "CreativeWork",
    "@id": "https://bioschemas.org/profiles/DataCatalog/0.3-RELEASE-2019_06_14/"
  },
  provider: [
    {
      "@type": "Organization",
      "@id": "https://www.wur.nl/",
      name: "Wageningen University & Research",
      url: "https://www.wur.nl/"
    }
  ],
  keywords: [
    "metabolomics",
    "genomics",
    "biosynthetic gene cluster",
    "tandem mass spectrometry"
  ]
};
