import * as React from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { IOMEGAPairedDataPlatform } from "../schema";

interface ProjectSummary {
    _id: string
    GNPSMassIVE_ID: string
    PI_name: string
    nr_genomes: number
    nr_growth_conditions: number
    nr_extraction_methods: number
    nr_instrumentation_methods: number
    nr_genome_metabolmics_links: number
    nr_genecluster_mspectra_links: number
}

type ProjectListItem = [string, IOMEGAPairedDataPlatform];

const summarizeProject = (d: ProjectListItem): ProjectSummary => {
    return {
        _id: d[0],
        GNPSMassIVE_ID: d[1]['metabolomics']['GNPSMassIVE_ID'],
        PI_name: d[1]['personal']['PI_name']!,
        nr_genomes: d[1]['genomes'].length,
        nr_growth_conditions: d[1]['experimental']['sample_preparation']!.length,
        nr_extraction_methods: d[1]['experimental']['extraction_methods']!.length,
        nr_instrumentation_methods: d[1]['experimental']['instrumentation_methods']!.length,
        nr_genome_metabolmics_links: d[1]['genome_metabolome_links'].length,
        nr_genecluster_mspectra_links: d[1]['BGC_MS2_links']!.length,
    }
}

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