import * as React from "react";
import { Button, Glyphicon } from 'react-bootstrap';
import { GenomeMetabolomicsTable } from './GenomeMetabolomicsTable';

interface IProps {
    data: any;
    schema: any;
}

// function flattenGenomeMetabolome(data) {
//     return {
//         columns: [],
//         rows: []
//     }
// }

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

    const metabolomeProps = props.schema.properties.data_to_link.properties.Metabolomics_details.properties;
    const metabolome = Object.keys(metabolomeProps).map((s: string) => {
        const field = metabolomeProps[s];
        return <li key={s}>{field.title}: {props.data.data_to_link.Metabolomics_details[s]}</li>;
    });
    return (
        <div>
            <h3>iOMEGA Paired data record:</h3>
            <Button href={dataUrl} download="paired_datarecord.json"><Glyphicon glyph="download" /> Download</Button>
            <h2>Submitter Information</h2>
            <ul>
                {submitter}
            </ul>
            <h2>Metabolomics project details</h2>
            <ul>
                {metabolome}
            </ul>

            <h2>Links between genomes and metabolomics data</h2>
            <GenomeMetabolomicsTable data={props.data} schema={props.schema}/>

            <h2>Linked gene clusters and MS2 spectra</h2>
        </div>
    );
}