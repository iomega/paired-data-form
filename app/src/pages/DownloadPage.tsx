import React from 'react';

const style = { padding: '10px' };

export const DownloadPage = () => {
    const doiLink = 'https://doi.org/10.5281/zenodo.3736430';
    const doi = '10.5281/zenodo.3736430';
    return (
        <div style={style}>
            <h2>Download</h2>
            <div>The projects in the platform are archived to the Zenodo repository each month.</div>
            <div>The archive file can be downloaded from the <b><a title="Download" target="_blank" rel="noopener noreferrer" href={doiLink}>Paired Omics Data Platform projects</a></b> Zenodo upload page.</div>
            <h3>How to cite</h3>
            <ul>
                <li>Please cite <a target="_blank" rel="noopener noreferrer" href={doiLink}>{doi}</a> if you use the projects dataset.</li>
                <li>Please cite <a target="_blank" rel="noopener noreferrer" href="https://doi.org/10.5281/zenodo.2656630">10.5281/zenodo.2656630</a> if you use this site or the <a target="_blank" rel="noopener noreferrer" href="https://github.com/iomega/paired-data-form/blob/master/manuals/developers.md#web-service">web service</a>.</li>
            </ul>
        </div>
    );
}