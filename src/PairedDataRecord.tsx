import * as React from "react";

import { Button, Glyphicon } from 'react-bootstrap';

import { GeneSpectraTable } from './GeneSpectraTable';
import { GenomeMetabolomicsTable } from './GenomeMetabolomicsTable';

interface IProps {
    data: any;
    schema: any;
}

function record2dataUrl(data: object, mimeType = 'application/json') {
    const bj = btoa(JSON.stringify(data, null, 4));
    return `data:${mimeType};base64,${bj}`
}

export const PairedDataRecord = (props: IProps) => {
    const dataUrl = record2dataUrl(props.data);
    const submitterProps = props.schema.properties.personal.properties;
    const submitter = Object.keys(submitterProps).map((s: string) => {
        const field = submitterProps[s];
        return <li key={s}>{field.title}: {props.data.personal[s]}</li>;
    });

    const metabolomeProps = props.schema.properties.metabolomics.properties;
    const metabolome = Object.keys(metabolomeProps).map((s: string) => {
        const field = metabolomeProps[s];
        return <li key={s}>{field.title}: {props.data.metabolomics[s]}</li>;
    });

    const GNPSMassIVE_ID = props.data.metabolomics.GNPSMassIVE_ID;
    const filename = `paired_datarecord_${GNPSMassIVE_ID}.json`;
    return (
        <div>
            <h3>iOMEGA Paired data record:</h3>
            <Button href={dataUrl} download={filename}><Glyphicon glyph="download" /> Download</Button>
            <h2>Submitter Information</h2>
            <ul>
                {submitter}
            </ul>
            <h2>Metabolomics project details</h2>
            <ul>
                {metabolome}
            </ul>

            <h2>Links between genomes and metabolomics data</h2>
            <GenomeMetabolomicsTable data={props.data} schema={props.schema} />

            <h2>Linked gene clusters and MS2 spectra</h2>
            <GeneSpectraTable data={props.data} schema={props.schema} />
        </div>
    );
}