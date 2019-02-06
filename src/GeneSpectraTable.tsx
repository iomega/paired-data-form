import * as React from 'react';

import { Table } from 'react-bootstrap';

interface IProps {
    data: any;
    schema: any;
}

export const GeneSpectraTable = (props: IProps) => {
    if (!props.data.BGC_MS2_links) {
        return <p>No links between gene clusters and MS2 spectra.</p>;
    }
    const mySchema = props.schema.properties.BGC_MS2_links.items;
    const myProps = mySchema.properties;
    const cols = Object.keys(myProps);
    let headers = cols.map((v: any, i: number) => {
        if (myProps[v].title) {
            return <th key={i}>{myProps[v].title}</th>;
        }
        return <th key={i}>{v}</th>;
    });

    const depKey = 'What would you like to link?';
    const depCols: string[] = [];
    const depHeaders: JSX.Element[] = [];
    mySchema.dependencies[depKey].oneOf.forEach((d: any) => {
        Object.keys(d.properties).filter(p => p !== depKey).forEach((p: any) => {
            depCols.push(p);
            depHeaders.push(<th key={headers.length + depHeaders.length}>{d.properties[p].title}</th>);
        });
    })
    headers = headers.concat(depHeaders);

    const rows = props.data.BGC_MS2_links.map((r: any, i: number) => {
        let tds = cols.map((c: any, ci: number) => {
            return <td key={ci}>{r[c]}</td>;
        });
        const depTds = depCols.map((c: string, ci: number) => {
            return <td key={tds.length + ci}>{r[c]}</td>;
        });
        tds = tds.concat(depTds);
        return (
            <tr key={i}>
                {tds}
            </tr>
        );
    });

    return (
        <Table condensed={true} striped={true} bordered={true}>
            <thead>
                <tr>
                    {headers}
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    );
};