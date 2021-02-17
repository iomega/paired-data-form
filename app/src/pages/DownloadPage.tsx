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
      <br />
      <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
        <img
          alt="Creative Commons License"
          style={{ borderWidth: 0 }}
          src="https://i.creativecommons.org/l/by/4.0/88x31.png"
        />
      </a>
      <br />
      This work is licensed under a{" "}
      <a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
        Creative Commons Attribution 4.0 International License
      </a>
      .
    </div>
  );
};
