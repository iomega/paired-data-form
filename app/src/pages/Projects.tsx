import * as React from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { ProjectSummary, summarizeProject } from "../summarize";

const useProjects = () => {
    const url = '/api/projects';
    const [data, setData] = useState<ProjectSummary[]>([]);
    async function fetchData() {
        const response = await fetch(url);
        const json = await response.json();
        const project_summaries = json.entries.map(summarizeProject);
        setData(project_summaries);
    }
    useEffect(() => { fetchData(); }, [url]);
    return data;
};

export function Projects() {
    const projects = useProjects();
    const rows = projects.map(d => (
        <tr key={d._id}>
            <td><Link to={`/projects/${d._id}`}>{d.GNPSMassIVE_ID}</Link></td>
            <td>{d.PI_name}</td>
            <td>{d.nr_genomes}</td>
            <td>{d.nr_growth_conditions}</td>
            <td>{d.nr_extraction_methods}</td>
            <td>{d.nr_instrumentation_methods}</td>
            <td>{d.nr_genome_metabolmics_links}</td>
            <td>{d.nr_genecluster_mspectra_links}</td>
        </tr>
    ));
    return (
        <div>
            <h1>List page with all approved datasets, search functionality</h1>
            <Table>
                <thead>
                    <tr>
                        <th>GNPS Massive identifier</th>
                        <th>Principal investigator</th>
                        <th>Nr of (meta)genomes</th>
                        <th>Nr of growth conditions</th>
                        <th>Nr of extraction methods</th>
                        <th>Nr of instrumention methods</th>
                        <th>Nr of links between genomes and metabolomics</th>
                        <th>Nr of links between gene clusters and MS2 spectra</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </div>
    );
}