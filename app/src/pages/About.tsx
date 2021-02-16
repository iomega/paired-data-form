import * as React from "react";
import { doi, doiLink } from "../constants";

import nlesc_logo from "./about/nlesc.png";
import wur_logo from "./about/wur.png";

const style = { padding: "10px" };

export const About = () => {
  const version = process.env.REACT_APP_VERSION;
  const url =
    "https://github.com/iomega/paired-data-form/releases/tag/v" + version;

  return (
    <div style={style}>
      <h2>About</h2>
      <h3>How to cite</h3>
      <ul>
        <li>
          Please cite{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.nature.com/articles/s41589-020-00724-z"
          >
            10.1038/s41589-020-00724-z
          </a>{" "}
          for the Nature Chemical Biology comment
        </li>
        <li>
          Please cite{" "}
          <a target="_blank" rel="noopener noreferrer" href={doiLink}>
            {doi}
          </a>{" "}
          if you use the projects dataset.
        </li>
        <li>
          Please cite{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://doi.org/10.5281/zenodo.2656630"
          >
            10.5281/zenodo.2656630
          </a>{" "}
          if you use the software like this site or the{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/iomega/paired-data-form/blob/master/manuals/developers.md#web-service"
          >
            web service
          </a>
          .
        </li>
      </ul>
      <h3>Who we are</h3>
      <ul>
        <li>Stefan Verhoeven, Netherlands eScience Center</li>
        <li>Justin van der Hooft, Wageningen University</li>
        <li>Michelle Schorn, Wageningen University</li>
        <li>Marnix Medema, Wageningen University</li>
        <li>Pieter Dorrestein, University of California San Diego</li>
      </ul>

      <div>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.esciencecenter.nl"
        >
          <img
            style={{ width: "500px" }}
            src={nlesc_logo}
            alt="Netherlands eScience Center"
          />
        </a>
        <a target="_blank" rel="noopener noreferrer" href="https://www.wur.nl">
          <img src={wur_logo} alt="Wageningen University" />
        </a>
      </div>

      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://github.com/iomega/paired-data-form/issues"
      >
        Technical questions and suggestions
      </a>
      <div>
        This site is running version{" "}
        <a target="_blank" rel="noopener noreferrer" href={url}>
          {version}
        </a>
      </div>
    </div>
  );
};
