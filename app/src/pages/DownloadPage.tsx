import React from 'react';
import { useVersionInfo } from '../api';

const style = { padding: '10px' };

export const DownloadPage = () => {
    const apiVersionInfo = useVersionInfo();

    if (apiVersionInfo.loading) {
        return <div style={style}>Loading ...</div>;
    }
    if (!apiVersionInfo.data) {
        return <div style={style}>Error: {apiVersionInfo.error!.message}</div>;
    }
    const zenodo = apiVersionInfo.data.dataset.zenodo;
    const doi = apiVersionInfo.data.dataset.doi;
    return (
        <div style={style}>
            <h2>Download</h2>
            <div>The projects in the platform are archived to the Zenodo repository each month.</div>
            <div>The archive file can be downloaded from the <b><a title="Download" target="_blank" rel="noopener noreferrer" href={zenodo}>Paired Omics Data Platform projects</a></b> Zenodo upload page.</div>
            <h3>How to cite</h3>
            <ul>
                <li>Please cite <a target="_blank" rel="noopener noreferrer" href={doi}>{doi}</a> if you use the projects dataset.</li>
                <li>Please cite <a target="_blank" rel="noopener noreferrer" href="https://doi.org/10.5281/zenodo.2656630">https://doi.org/10.5281/zenodo.2656630</a> if you use this site or the <a title="Download" target="_blank" rel="noopener noreferrer" href="https://github.com/iomega/paired-data-form/blob/master/manuals/developers.md#web-service">web service</a>.</li>
            </ul>
        </div>
    );
}