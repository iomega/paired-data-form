import * as React from "react";

import nlesc_logo from './about/nlesc.png';
import wur_logo from './about/wur.png';

const style = { padding: '10px' };

export const About = () => {
    const version = process.env.REACT_APP_VERSION;
    const url = 'https://github.com/iomega/paired-data-form/releases/tag/v' + version;

    return (
        <div style={style}>
            <h2>About</h2>

            <h3>Who we are</h3>
            <ul>
                <li>Stefan Verhoeven, Netherlands eScience Center</li>
                <li>Justin van der Hooft, Wageningen University</li>
                <li>Michelle Shorn, Wageningen University</li>
                <li>Marnix Medema, Wageningen University</li>
                <li>Pieter Dorrestein, University of California San Diego</li>
            </ul>

            <div>
                <a target="_blank" rel="noopener noreferrer" href="https://www.esciencecenter.nl"><img style={{ width: '500px' }} src={nlesc_logo} alt="Netherlands eScience Center" /></a>
                <a target="_blank" rel="noopener noreferrer" href="https://www.wur.nl"><img src={wur_logo} alt="Wageningen University" /></a>
            </div>

            <a target="_blank" rel="noopener noreferrer" href="https://github.com/iomega/paired-data-form/issues">Technical questions and suggestions</a>
            <div>This site is running version <a target="_blank" rel="noopener noreferrer" href={url}>{version}</a></div>
        </div>
    )
};