import * as React from "react";

import { Table, Button, Glyphicon, Panel, PanelGroup } from 'react-bootstrap';

import { ExtractionExpander } from './expanders/ExtractionExpander';
import { GenomeExpander } from './expanders/GenomeExpander';
import { InstrumentExpander } from './expanders/InstrumentExpander';
import { SampleGrowthConditionsExpander } from './expanders/SampleGrowthConditionsExpander';
import { tsvUrl } from './textTable';
import { IOMEGAPairedDataPlatform } from "./schema";

interface IProps {
    data: any;
    schema: any;
}

export const GenomeMetabolomicsTable = (props: IProps) => {
    const [isCollapsed, changeCollapsing] = React.useState(true);
    const pure_project: IOMEGAPairedDataPlatform = props.data.project;
    if (!pure_project.genome_metabolome_links || pure_project.genome_metabolome_links.length === 0) {
        return <p>No links between (meta)genomes and metabolimics data files.</p>;
    }
    const genome_enrichments = props.data.enrichments && props.data.enrichments.genomes ? props.data.enrichments.genomes : {};
    const genomeExpander = new GenomeExpander(props.schema, pure_project, genome_enrichments);
    const sampleExpander = new SampleGrowthConditionsExpander(props.schema, pure_project);
    const extractionExpander = new ExtractionExpander(props.schema, pure_project);
    const instrumentExpander = new InstrumentExpander(props.schema, pure_project);
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

    const gmRows = pure_project.genome_metabolome_links;
    let rows = gmRows.map((row: any, i: number) => {
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
    const genomemetabolometsvfn = 'paired-' + props.data._id + '-genome-metabolome.tsv';

    const columnIndexesToShowCollapsed = [0, 9, 19, 22, 30];
    if (isCollapsed) {
        // remove all columns not in columnIndexesToShowFolded
        genomeHeaders.splice(0, genomeHeaders.length - 1);
        sampleHeaders.splice(0, sampleHeaders.length - 1);
        extractionHeaders.splice(0, extractionHeaders.length - 1);
        instrumentHeaders.splice(0, instrumentHeaders.length - 1);
        headers = columnIndexesToShowCollapsed.map(c => headers[c]);
        rows = rows.map((r: any, i: number) => {
            return <tr key={i}>
                {columnIndexesToShowCollapsed.map(c => r.props.children[c])}
            </tr>;
        });
    }
    return (
        <>
            <Table condensed={true} striped={true} bordered={true}>
                <thead>
                    <tr>
                        <th colSpan={cols.length}>
                            <Button bsSize="xs" onClick={() => changeCollapsing(!isCollapsed)} title={isCollapsed ? 'Expand table, show all columns' : 'Collapse table, only show label columns'}>
                                <Glyphicon glyph={isCollapsed ? 'plus' : 'minus'} /> {isCollapsed ? 'Expand' : 'Collapse'}
                            </Button>
                        </th>
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

            <h2 id="genomes">(meta) Genomes</h2>
            <PanelGroup accordion id="genomes" defaultActiveKey={pure_project.genomes[0].genome_label}>
                {pure_project.genomes.map((g)=> (
                    <Panel eventKey={g.genome_label}>
                        <Panel.Heading>
                            <Panel.Title toggle>{g.genome_label}</Panel.Title>
                        </Panel.Heading>
                        <Panel.Body collapsible>
                            {g.genome_ID.genome_type === 'genome' ? 
                                <span>
                                    <p>GenBank: <a href="https://www.ncbi.nlm.nih.gov/nuccore/{g.genome_ID.GenBank_accession}">{g.genome_ID.GenBank_accession}</a></p> 
                                    <p>RefSeq: {g.genome_ID.RefSeq_accession}</p> 
                                </span>
                                : 
                                <p></p>
                            }
                            <p>Biosample: {g.BioSample_accession}</p>
                            <p>Key publications: {g.publications}</p>
                        </Panel.Body>
                    </Panel>
                ))}
            </PanelGroup>
            <a href={tsvUrl(props.schema, pure_project)} download={genomemetabolometsvfn}>tab delimited downoad</a>
        </>
    );
}