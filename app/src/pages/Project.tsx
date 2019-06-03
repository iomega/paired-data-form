import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { PairedDataProject } from "../PairedDataProject";
import { useFetch } from "../useFetch";
import { useProject } from "../api";
import { ButtonGroup } from "react-bootstrap";

interface TParams {
    id: string
}

const style = {padding: '10px'};

export function Project({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const data = useProject(project_id);
    const schema = useFetch('/schema.json');
    let record = <span>Loading ...</span>;
    if (data && schema) {
        record = (
            <div style={style}>
                <PairedDataProject data={data} schema={schema} />
                <ButtonGroup>
                    <Link className="btn btn-default" to={`/projects/${project_id}/history`}>History</Link>
                    <Link className="btn btn-default" to={`/projects/${project_id}/edit`}>Edit</Link>
                    <Link className="btn btn-default" to={`/projects/${project_id}/clone`}>Clone</Link>
                </ButtonGroup>
            </div>
        );
    }
    return record;
}