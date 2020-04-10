import * as React from "react";
import { useState } from "react";
import { Table, Glyphicon, FormControl, Button, Form, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";

import { useProjects } from "../api";
import { compareProjectSummary } from "../summarize";

const style = { padding: '10px' };

interface ColumnHeaderProps {
    active: string;
    skey: string;
    onClick(key: string): void;
    title: string;
}

const ColumnHeader = ({ active, skey, onClick, title }: ColumnHeaderProps) => (
    <th>
        <span title="Click to sort on" style={
            active !== skey ? { cursor: 'pointer' } : {}
        } onClick={() => active !== skey && onClick(skey)}>{title}</span>
        {active === skey && <Glyphicon glyph="sort-by-attributes-alt" />}
    </th>
)

export function Projects() {
    const [query, setQuery] = useState<string>('');
    const projects = useProjects();
    const [sortkey, setSortKey] = useState('met_id');

    const sortOn = (key: string) => {
        // TODO reverse sort when sorted column is clicked again
        const data = [...projects.data];
        data.sort(compareProjectSummary(key));
        projects.setData({ data });
        setSortKey(key);
    }

    if (projects.loading) {
        return <span>Loading ...</span>;
    }
    if (projects.error) {
        return <span>Error: {projects.error.message}</span>
    }
    const rows = projects.data.map(d => (
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
        <div style={style}>
            <h2>Available projects</h2>
            <Form onSubmit={(e) => {
                e.preventDefault();
                projects.setQuery(query);
            }}>
                <InputGroup>
                    <FormControl
                        type="text"
                        value={query}
                        placeholder="Search ..."
                        onChange={(e: any) => setQuery(e.target.value)}
                    />
                    {query && (
                        <InputGroup.Button>
                            <Button type="reset" onClick={() => {
                                setQuery('');
                                if (projects.query) {
                                    projects.setQuery('');
                                }
                            }}>
                                <Glyphicon glyph="remove" />
                            </Button>
                        </InputGroup.Button>
                    )}
                    <InputGroup.Button>
                        <Button type="submit">
                            <Glyphicon glyph="search" />
                        </Button>
                    </InputGroup.Button>
                </InputGroup>
            </Form>
            <Table>
                <thead>
                    <tr>
                        <ColumnHeader skey="met_id" active={sortkey} onClick={sortOn} title="Metabolomics project identifier" />
                        <ColumnHeader skey="PI_name" active={sortkey} onClick={sortOn} title="Principal investigator" />
                        <ColumnHeader skey="submitters" active={sortkey} onClick={sortOn} title="Submitter(s)" />
                        <ColumnHeader skey="nr_genomes" active={sortkey} onClick={sortOn} title="Nr of (meta)genomes" />
                        <ColumnHeader skey="nr_growth_conditions" active={sortkey} onClick={sortOn} title="Nr of growth conditions" />
                        <ColumnHeader skey="nr_extraction_methods" active={sortkey} onClick={sortOn} title="Nr of extraction methods" />
                        <ColumnHeader skey="nr_instrumentation_methods" active={sortkey} onClick={sortOn} title="Nr of instrumentation methods" />
                        <ColumnHeader skey="nr_genome_metabolmics_links" active={sortkey} onClick={sortOn} title="Nr of links between genome and metabolome samples" />
                        <ColumnHeader skey="nr_genecluster_mspectra_links" active={sortkey} onClick={sortOn} title="Nr of links between gene clusters and MS2 spectra" />
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </div>
    );
}
