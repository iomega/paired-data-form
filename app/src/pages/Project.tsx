import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { PairedDataProject } from "../PairedDataProject";
import { useProject, useSchema } from "../api";
import { ButtonGroup } from "react-bootstrap";

interface TParams {
    id: string
}

const style = {padding: '10px'};

export function Project({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const project = useProject(project_id);
    const schema = useSchema();
    if (project.loading || schema.loading) {
        return <div style={style}>Loading...</div>;
    }
    if (!project.data && project.error) {
        return <div style={style}>Error: {project.error.message}</div>;
    }
    if (!schema.data && schema.error) {
        return <div style={style}>Error: {schema.error.message}</div>;
    }
    return (
        <div style={style}>
            <PairedDataProject data={project.data} schema={schema.data} />
            <ButtonGroup>
                <Link className="btn btn-default" to={`/projects/${project_id}/history`}>History</Link>
                <Link className="btn btn-default" to={`/projects/${project_id}/edit`}>Edit</Link>
                <Link className="btn btn-default" to={`/projects/${project_id}/clone`}>Clone</Link>
            </ButtonGroup>
        </div>
    );
}