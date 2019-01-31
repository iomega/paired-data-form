import * as React from "react";
import { Table } from 'react-bootstrap';

interface IProps {
    data: any;
    schema: any;
}

interface IExpander {
    fk: string;
    ths(offset: number): JSX.Element[];
    tds(row: any, offset: number): JSX.Element[];
}

class GenomeExpander implements IExpander {
    public fk = 'Genome_Metagenome_ID';
    private foreignTable = 'metagenome_genome sequence_assemblies';
    private schema: any;
    private lookup: any[];
    
    constructor(schema: any, data: any) {
        this.schema = schema.properties.data_to_link.properties[this.foreignTable].items.properties
        this.lookup = data.data_to_link[this.foreignTable];
    }

    public ths(offset: number) {
        return this.headers().map((s, i) => <th key={i + offset}>{s}</th>);
    }

    public tds(row: any, offset: number) {
        const genome = this.find(row);
        const genomeCols = this.cols(genome);
        return genomeCols.map((td, tdi) => {
            return (<td key={tdi + offset}>{td}</td>);
        });
    }

    private headers() {
        return Object.keys(this.schema).map(k => this.schema[k].title);
    }
    private cols(row: object) {
        return Object.keys(this.schema).map(k => row[k]);
    }

    private find(row: any) {
        const genomeId = row[this.fk];
        return this.lookup.find((r: any) => (
            r.GenBank_accession === genomeId ||
            r.RefSeq_accession === genomeId || 
            r.ENA_NCBI_accession === genomeId || 
            r.MGnify_accession === genomeId
        ));
    }
}

export const GenomeMetabolomicsTable = (props: IProps) => {
    if (!props.data.Genome_Metabolome_links) {
        return <div>No links between (meta)genomes and metabolimics data files.</div>;
    }
    const genomeExpander = new GenomeExpander(props.schema, props.data);
    const gmProps = props.schema.properties.Genome_Metabolome_links.items.properties;
    const foreignKeys = new Set([genomeExpander.fk]);
    const cols = Object.keys(gmProps).filter(k => !foreignKeys.has(k));

    let headers = cols.map((s) => {
        const field = gmProps[s];
        return <th key={s}>{field.title}</th>;
    });
    const genomeHeaders = genomeExpander.ths(headers.length);
    headers = headers.concat(genomeHeaders);

    const gmRows = props.data.Genome_Metabolome_links;
    const rows = gmRows.map((row: any, i: number) => {
        let tds = cols.map((td, tdi) => {
            return (<td key={tdi}>{row[td]}</td>);
        });
        
        const genomeTds = genomeExpander.tds(row, tds.length);
        tds = tds.concat(genomeTds);
        return (
            <tr key={i}>
                {tds}
            </tr>
        );
    });
    return (
        <Table>
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
}