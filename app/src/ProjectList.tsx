import React from "react";
import { ProjectSummary } from "./summarize";
import { Glyphicon, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

interface ColumnHeaderProps {
    active: string;
    skey: string;
    onClick(key: string): void;
    title: string;
    sortOrder: 'desc' | 'asc'
}

const ColumnHeader = ({ active, skey, onClick, title, sortOrder }: ColumnHeaderProps) => {
    let glyph = <></>;
    if (active === skey) {
        if (sortOrder === 'asc') {
            glyph = <Glyphicon glyph="sort-by-attributes-alt" />;
        } else {
            glyph = <Glyphicon glyph="sort-by-attributes" />;
        }
    }
    return (
        <th
            onClick={() => onClick(skey)}
            style={{ cursor: 'pointer' }}
            title="Click to sort on">
            <span>{title}</span>
            <> {glyph}</>
        </th>
    );
}

interface Props {
    projects: ProjectSummary[];
    setSortedOn(key: string): void;
    sortKey: string;
    sortOrder: 'desc' | 'asc';
}

export const ProjectList = ({ projects, setSortedOn, sortKey, sortOrder }: Props) => {
    const rows = projects.map(d => (
        <tr key={d._id}>
            <td><Link to={`/projects/${d._id}`}>{d.metabolite_id}</Link></td>
            <td>{d.PI_name}</td>
            <td>{d.submitters}</td>
            <td>{d.nr_genomes}</td>
            <td>{d.nr_growth_conditions}</td>
            <td>{d.nr_extraction_methods}</td>
            <td>{d.nr_instrumentation_methods}</td>
            <td>{d.nr_genome_metabolomics_links}</td>
            <td>{d.nr_genecluster_mspectra_links}</td>
        </tr>
    ));
    if (projects.length === 0) {
        rows.push(<tr key="0"><td colSpan={9}>No projects found.</td></tr>);
    }
    return (
        <Table>
            <thead>
                <tr>
                    <ColumnHeader sortOrder={sortOrder} skey="met_id" active={sortKey} onClick={setSortedOn} title="Metabolomics project identifier" />
                    <ColumnHeader sortOrder={sortOrder} skey="PI_name" active={sortKey} onClick={setSortedOn} title="Principal investigator" />
                    <ColumnHeader sortOrder={sortOrder} skey="submitters" active={sortKey} onClick={setSortedOn} title="Submitter(s)" />
                    <ColumnHeader sortOrder={sortOrder} skey="nr_genomes" active={sortKey} onClick={setSortedOn} title="Nr of (meta)genomes" />
                    <ColumnHeader sortOrder={sortOrder} skey="nr_growth_conditions" active={sortKey} onClick={setSortedOn} title="Nr of growth conditions" />
                    <ColumnHeader sortOrder={sortOrder} skey="nr_extraction_methods" active={sortKey} onClick={setSortedOn} title="Nr of extraction methods" />
                    <ColumnHeader sortOrder={sortOrder} skey="nr_instrumentation_methods" active={sortKey} onClick={setSortedOn} title="Nr of instrumentation methods" />
                    <ColumnHeader sortOrder={sortOrder} skey="nr_genome_metabolomics_links" active={sortKey} onClick={setSortedOn} title="Nr of links between genome and metabolome samples" />
                    <ColumnHeader sortOrder={sortOrder} skey="nr_genecluster_mspectra_links" active={sortKey} onClick={setSortedOn} title="Nr of links between gene clusters and MS2 spectra" />
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    );
}
