import * as React from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useContext } from "react";

import { Decide } from "../Decide";
import { AuthContext } from "../auth";
import { ProjectSummary } from "../summarize";
import { usePendingProjects, denyPendingProject, approvePendingProject } from "../api";
import { DownloadPendingProject } from "../DownloadPendingProject";

const style = { padding: '10px' };

function dropProject(id: string, list: ProjectSummary[]) {
    const updated = [...list];
    const index = updated.findIndex(p => p._id === id);
    updated.splice(index, 1);
    return updated;
}

export function PendingProjects() {
    const projects = usePendingProjects();
    const { token } = useContext(AuthContext);
    if (projects.loading) {
        return <div>Loading ...</div>;
    }
    if (projects.error && !projects.data) {
        return <div>Error: {projects.error.message}</div>;
    }
    const onDeny = (project_id: string) => async () => {
        await denyPendingProject(project_id, token);
        const pruned_projects = dropProject(project_id, projects.data!.data)
        projects.setData({ data: pruned_projects });
    };
    const onApprove = (project_id: string) => async () => {
        await approvePendingProject(project_id, token);
        const pruned_projects = dropProject(project_id, projects.data!.data)
        projects.setData({ data: pruned_projects });
    };
    const rows = projects.data!.data.map(d => (
        <tr key={d._id} role="listitem">
            <td>
                <Decide onDeny={onDeny(d._id)} onApprove={onApprove(d._id)} />
            </td>
            <td><Link to={`/pending/${d._id}`}>{d.metabolite_id}</Link></td>
            <td>{d.PI_name}</td>
            <td>{d.submitters}</td>
            <td>{d.nr_genomes}</td>
            <td>{d.nr_growth_conditions}</td>
            <td>{d.nr_extraction_methods}</td>
            <td>{d.nr_instrumentation_methods}</td>
            <td>{d.nr_genome_metabolomics_links}</td>
            <td>{d.nr_genecluster_mspectra_links}</td>
            <td><DownloadPendingProject project_id={d._id} token={token} /></td>
        </tr>
    ));
    if (projects.data!.data.length === 0) {
        rows.push(<tr key="empty"><td colSpan={10}>No pending projects found.</td></tr>);
    }
    return (
        <div style={style}>
            <h2>Pending projects that require approval</h2>
            <Table>
                <thead>
                    <tr>
                        <th>Approve/Deny</th>
                        <th>Metabolomics project identifier</th>
                        <th>Principal investigator</th>
                        <th>Submitter(s)</th>
                        <th>Nr of (meta)genomes</th>
                        <th>Nr of growth conditions</th>
                        <th>Nr of extraction methods</th>
                        <th>Nr of instrumention methods</th>
                        <th>Nr of links between genomes and metabolomics</th>
                        <th>Nr of links between gene clusters and MS2 spectra</th>
                        <th>Download</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </div>
    );
}
