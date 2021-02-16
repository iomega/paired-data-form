import React from "react";
import { doiLink } from "../constants";

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
    </div>
  );
};
