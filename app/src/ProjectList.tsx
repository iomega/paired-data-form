import React from "react";
import { ProjectSummary } from "./summarize";
import { Glyphicon, Table } from "react-bootstrap";
import { Link } from "react-router-dom";

interface ColumnHeaderProps {
    active: string;
    skey: string;
    onClick(key: string): void;
    title: string;
}

const ColumnHeader = ({ active, skey, onClick, title }: ColumnHeaderProps) => (
    <th
        onClick={() => active !== skey && onClick(skey)}
        style={active !== skey ? { cursor: 'pointer' } : {}}
        title="Click to sort on">
        <span>{title}</span>
        {active === skey && <> <Glyphicon glyph="sort-by-attributes-alt" /></>}
    </th>
)

interface Props {
    projects: ProjectSummary[];
    setSortedOn(key: string): void;
    sortedOn: string;
}

export const ProjectList = ({ projects, setSortedOn, sortedOn }: Props) => {
    const rows = projects.map(d => (
        <tr key={d._id}>
            <td><Link to={`/projects/${d._id}`}>{d.GNPSMassIVE_ID ? d.GNPSMassIVE_ID : d.metabolights_study_id}</Link></td>
            <td>{d.PI_name}</td>
            <td>{d.submitters}</td>
            <td>{d.nr_genomes}</td>
            <td>{d.nr_growth_conditions}</td>
            <td>{d.nr_extraction_methods}</td>
            <td>{d.nr_instrumentation_methods}</td>
            <td>{d.nr_genome_metabolmics_links}</td>
            <td>{d.nr_genecluster_mspectra_links}</td>
        </tr>
    ));
    return (
        <Table>
            <thead>
                <tr>
                    <ColumnHeader skey="met_id" active={sortedOn} onClick={setSortedOn} title="Metabolomics project identifier" />
                    <ColumnHeader skey="PI_name" active={sortedOn} onClick={setSortedOn} title="Principal investigator" />
                    <ColumnHeader skey="submitters" active={sortedOn} onClick={setSortedOn} title="Submitter(s)" />
                    <ColumnHeader skey="nr_genomes" active={sortedOn} onClick={setSortedOn} title="Nr of (meta)genomes" />
                    <ColumnHeader skey="nr_growth_conditions" active={sortedOn} onClick={setSortedOn} title="Nr of growth conditions" />
                    <ColumnHeader skey="nr_extraction_methods" active={sortedOn} onClick={setSortedOn} title="Nr of extraction methods" />
                    <ColumnHeader skey="nr_instrumentation_methods" active={sortedOn} onClick={setSortedOn} title="Nr of instrumentation methods" />
                    <ColumnHeader skey="nr_genome_metabolmics_links" active={sortedOn} onClick={setSortedOn} title="Nr of links between genome and metabolome samples" />
                    <ColumnHeader skey="nr_genecluster_mspectra_links" active={sortedOn} onClick={setSortedOn} title="Nr of links between gene clusters and MS2 spectra" />
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </Table>
    );
}
