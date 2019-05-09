import * as React from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Decide } from "../Decide";
import { AuthContext } from "../auth";
import { useContext } from "react";

const data = [{
    _id: '/pending/MSV000078839.1',
    gnps: 'MSV000078839',
    pi: 'Justin van der Hooft',
    nr_genomes: 3,
    nr_growth_conditions: 3,
    nr_extraction_methods: 3,
    nr_instrumentation_methods: 1,
    nr_genome_metabolmics_links: 21,
    nr_genecluster_mspectra_links: 0,
}];


export function PendingProjects() {
    const {token} = useContext(AuthContext);
    const rows = data.map(d => (
        <tr key={d._id}>
            <td>
                <Decide onDeny={()=> {}} onApprove={()=> {}}/>
            </td>
            <td><Link to={d._id}>{d.gnps}</Link></td>
            <td>{d.pi}</td>
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
            <h1>List page of pending datasets that require approval</h1>
            <Table>
                <thead>
                    <tr>
                        <th>Approve/Deny</th>
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
            <span>API Token = {token}</span>
        </div>
    );
}