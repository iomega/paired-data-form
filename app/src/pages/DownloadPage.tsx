import React from "react";
import { doiLink, doi } from "../constants";

const style = { padding: "10px" };

export const DownloadPage = () => {
  return (
    <div style={style}>
      <h2>Download</h2>
      <div>
        The projects in the platform are archived to the Zenodo repository each
        month.
      </div>
      <div>
        The archive file can be downloaded from the{" "}
        <b>
          <a
            title="Download"
            target="_blank"
            rel="noopener noreferrer"
            href={doiLink}
          >
            Paired Omics Data Platform projects
          </a>
        </b>{" "}
        Zenodo upload page.
      </div>
      <h3>How to cite</h3>
      <ul>
        <li>
          Please cite{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://doi.org/10.1038/s41589-020-00724-z"
          >
            10.1038/s41589-020-00724-z
          </a>{" "}
          for the Nature Chemical Biology paper
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
    </div>
  );
};
