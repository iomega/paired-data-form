import * as React from 'react';

import { Table } from 'react-bootstrap';

interface IProps {
    data: any;
    schema: any;
}

function oneOfSplat(schema: any, prop: string, offset: number) {
    const splat = new Map<string, JSX.Element>();
    schema.dependencies[prop].oneOf.forEach((d: any) => {
        Object.keys(d.properties).filter(p => p !== prop).forEach((p: any) => {
            splat.set(p, <th key={offset + splat.size}>{d.properties[p].title}</th>);
        });
    });
    return splat;
}

export const GeneSpectraTable = (props: IProps) => {
    if (!props.data.BGC_MS2_links) {
        return <p>No links between gene clusters and MS2 spectra.</p>;
    }
    const mySchema = props.schema.properties.BGC_MS2_links.items;
    const myProps = mySchema.properties;
    const depKey = 'link';
    const bgcKey = 'BGC_ID';
    const cols = Object.keys(myProps).filter(v => (v !== depKey && v !== bgcKey));
    let headers: JSX.Element[] = [];
    cols.forEach((v: any, i: number) => {
        const prop = myProps[v];
        if (prop.title) {
            headers.push(<th key={i}>{prop.title}</th>);
        } else {
            headers.push(<th key={i}>{v}</th>);
        }
    });

    const bgcSplat = oneOfSplat(mySchema.properties.BGC_ID, 'BGC', headers.length);
    const bgcCols = Array.from(bgcSplat.keys());
    headers = headers.concat(Array.from(bgcSplat.values()));

    const depSplat = oneOfSplat(mySchema, depKey, headers.length);
    const depCols = Array.from(depSplat.keys());
    headers = headers.concat(Array.from(depSplat.values()));

    const rows = props.data.BGC_MS2_links.map((r: any, i: number) => {
        let tds = cols.map((c: any, ci: number) => {
            return <td key={ci}>{r[c]}</td>;
        });

        const bgcTds = bgcCols.map((c: string, ci: number) => {
            return <td key={tds.length + ci}>{r.BGC_ID[c]}</td>;
        });
        tds = tds.concat(bgcTds);

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
                    <td colSpan={cols.length} />
                    <td colSpan={bgcCols.length}>{myProps[bgcKey].title}</td>
                    <td colSpan={depCols.length}>{myProps[depKey].title}</td>
                </tr>
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