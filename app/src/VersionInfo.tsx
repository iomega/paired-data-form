import React from 'react';
import { useVersionInfo } from './api';

const style = { padding: '10px' };

export const VersionInfo = () => {
    const apiVersionInfo = useVersionInfo();
    const app = process.env.REACT_APP_VERSION;

    if (apiVersionInfo.loading) {
        return <div style={style}>Loading ...</div>;
    }
    if (!apiVersionInfo.data) {
        return <div style={style}>Error: {apiVersionInfo.error!.message}</div>;
    }
    return (
        <div>
            <ul>
                <li>Archived file of all projects available at <a href={apiVersionInfo.data.doi}>{apiVersionInfo.data.doi}</a>.</li>
                <li>Software version of web application is {app} and for web service is {apiVersionInfo.data.api}.</li>
            </ul>
        </div>
    );
}