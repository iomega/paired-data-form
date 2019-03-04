import * as React from "react";

import { Table } from 'react-bootstrap';

import { ExtractionExpander } from './expanders/ExtractionExpander';
import { GenomeExpander } from './expanders/GenomeExpander';
import { InstrumentExpander } from './expanders/InstrumentExpander';
import { SampleGrowthConditionsExpander } from './expanders/SampleGrowthConditionsExpander';
import { tsvUrl } from './textTable';

interface IProps {
    data: any;
    schema: any;
}

export const GenomeMetabolomicsTable = (props: IProps) => {
    if (!props.data.genome_metabolome_links) {
        return <p>No links between (meta)genomes and metabolimics data files.</p>;
    }
    const genomeExpander = new GenomeExpander(props.schema, props.data);
    const sampleExpander = new SampleGrowthConditionsExpander(props.schema, props.data);
    const extractionExpander = new ExtractionExpander(props.schema, props.data);
    const instrumentExpander = new InstrumentExpander(props.schema, props.data);
    const gmProps = props.schema.properties.genome_metabolome_links.items.properties;
    const foreignKeys = new Set([
        genomeExpander.fk,
        sampleExpander.fk,
        extractionExpander.fk,
        instrumentExpander.fk,
    ]);
    const cols = Object.keys(gmProps).filter(k => !foreignKeys.has(k));

    let headers = cols.map((s) => {
        const field = gmProps[s];
        return <th key={s}>{field.title}</th>;
    });
    const genomeHeaders = genomeExpander.ths(headers.length);
    headers = headers.concat(genomeHeaders);
    const sampleHeaders = sampleExpander.ths(headers.length);
    headers = headers.concat(sampleHeaders);
    const extractionHeaders = extractionExpander.ths(headers.length);
    headers = headers.concat(extractionHeaders);
    const instrumentHeaders = instrumentExpander.ths(headers.length);
    headers = headers.concat(instrumentHeaders);

    const gmRows = props.data.genome_metabolome_links;
    const rows = gmRows.map((row: any, i: number) => {
        let tds = cols.map((td, tdi) => {
            if (td === 'Metabolomics_Data_File') {
                return (<td key={tdi}><a href={row[td]}>{row[td]}</a></td>);
            }
            return (<td key={tdi}>{row[td]}</td>);
        });

        const genomeTds = genomeExpander.tds(row, tds.length);
        tds = tds.concat(genomeTds);
        const sampleTds = sampleExpander.tds(row, tds.length);
        tds = tds.concat(sampleTds);
        const extractionTds = extractionExpander.tds(row, tds.length);
        tds = tds.concat(extractionTds);
        const instrumentTds = instrumentExpander.tds(row, tds.length);
        tds = tds.concat(instrumentTds);
        return (
            <tr key={i}>
                {tds}
            </tr>
        );
    });
    const genomemetabolometsvfn = 'paired-' + props.data.metabolomics.GNPSMassIVE_ID + '-genome-metabolome.tsv';
    return (
        <div>
            <Table condensed={true} striped={true} bordered={true}>
                <thead>
                    <tr>
                        <th colSpan={cols.length} />
                        <th colSpan={genomeHeaders.length}>{gmProps[genomeExpander.fk].title}</th>
                        <th colSpan={sampleHeaders.length}>{gmProps[sampleExpander.fk].title}</th>
                        <th colSpan={extractionHeaders.length}>{gmProps[extractionExpander.fk].title}</th>
                        <th colSpan={instrumentHeaders.length}>{gmProps[instrumentExpander.fk].title}</th>
                    </tr>
                    <tr>
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
            <a href={tsvUrl(props.schema, props.data)} download={genomemetabolometsvfn}>tab delimited downoad</a>
        </div>
    );
}