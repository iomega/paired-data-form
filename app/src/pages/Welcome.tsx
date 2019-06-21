import * as React from "react";
import overview from './overview.png';

const style = {padding: '10px'};

export function Welcome() {
    return (
        <div style={style}>
            <h1>Paired omics data platform</h1>
            <p>This Paired Data Platform is a community-based initiative standardizing links between genomic and metabolomics data in a computer-readable manner to further the field of natural products discovery. 
            </p>
            <img src={overview} width="100%" alt="Overview"/>
        </div>
    );
}