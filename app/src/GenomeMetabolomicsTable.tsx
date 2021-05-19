import * as React from "react";

import { Table, Button, OverlayTrigger, Glyphicon } from 'react-bootstrap';

import { tsvUrl } from './textTable';
import { IOMEGAPairedOmicsDataPlatform } from "./schema";

import './GenomeMetabolomicsTable.css';
import { makeGenomePopovers, makeSamplePopovers, makeExtractionPopovers, makeInstrumentPopovers, makeProteomePopovers } from "./makeProteomePopovers";

export interface IProps {
    data: any;
    schema: any;
}

export const GenomeMetabolomicsTable = (props: IProps) => {
    const pure_project: IOMEGAPairedOmicsDataPlatform = props.data.project;
    if (!pure_project.genome_metabolome_links || pure_project.genome_metabolome_links.length === 0) {
        return <p>No links between (meta)genomes, proteomes and metabolomics data files.</p>;
    }
    const genome_enrichments = props.data.enrichments && props.data.enrichments.genomes ? props.data.enrichments.genomes : {};
    const gmProps = props.schema.properties.genome_metabolome_links.items.properties;
    const cols = Object.keys(gmProps);

    let headers = cols.map((s) => {
        const field = gmProps[s];
        return <th key={s}>{field.title}</th>;
    });
    const genomemetabolometsvfn = 'paired-' + props.data._id + '-genome-metabolome.tsv';

    const genome_popovers: any = makeGenomePopovers(pure_project, genome_enrichments);
    const sample_popovers: any = makeSamplePopovers(pure_project, props);
    const extraction_popovers: any = makeExtractionPopovers(pure_project, props);
    const instrument_popovers: any = makeInstrumentPopovers(pure_project, props);
    const proteome_popovers: any = makeProteomePopovers(pure_project, genome_popovers, sample_popovers, extraction_popovers, instrument_popovers);

    const rows = pure_project.genome_metabolome_links.map((r) => (
        <tr key={r.metabolomics_file}>
            <td>
                <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={genome_popovers[r.genome_label]}
                >
                    <Button bsStyle="link">
                        {r.genome_label}
                    </Button>
                </OverlayTrigger>
            </td>
            <td>
                { r.proteome_label && <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={proteome_popovers[r.proteome_label]}
                >
                    <Button bsStyle="link">
                        {r.proteome_label}
                    </Button>
                </OverlayTrigger>
                }
            </td>
            <td>{r.metabolomics_file}<Button title={`Download ${r.metabolomics_file}`} bsStyle="link" href={r.metabolomics_file}><Glyphicon style={{color:"gray"}} glyph="download-alt"/></Button></td>
            <td>
                <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={sample_popovers[r.sample_preparation_label]}
                >
                    <Button bsStyle="link">
                        {r.sample_preparation_label}
                    </Button>
                </OverlayTrigger>
            </td>
            <td>
                <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={extraction_popovers[r.extraction_method_label]}
                >
                    <Button bsStyle="link">
                        {r.extraction_method_label}
                    </Button>
                </OverlayTrigger>
            </td>
            <td>
                <OverlayTrigger
                    trigger="click"
                    rootClose
                    placement="bottom"
                    overlay={instrument_popovers[r.instrumentation_method_label]}
                >
                    <Button bsStyle="link">
                        {r.instrumentation_method_label}
                    </Button>
                </OverlayTrigger>
            </td>
        </tr>
    ));

    return (
        <>
            <Table condensed={true} striped={true} bordered={true} responsive={true}>
                <thead>
                    <tr>
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>

            <a href={tsvUrl(props.schema, pure_project)} download={genomemetabolometsvfn}>tab delimited downoad</a>
        </>
    );
}
