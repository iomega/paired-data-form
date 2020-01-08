import * as React from "react";

import nlesc_logo from './about/nlesc.png';
import wur_logo from './about/wur.png';

const style = { padding: '10px' };

export const About = () => (
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
            <a href="https://www.esciencecenter.nl"><img style={{width:'30%'}} src={nlesc_logo} alt="Netherlands eScience Center"/></a>
            <a href="https://www.wur.nl"><img src={wur_logo} alt="Wageningen University"/></a>
        </div>

        <a href="https://github.com/iomega/paired-data-form/issues">Technical questions and suggestions</a>
    </div>
);
