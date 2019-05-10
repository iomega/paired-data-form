import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { PairedDataRecord } from "../PairedDataRecord";
import { useFetch } from "../useFetch";
import { useProject } from "../api";

interface TParams {
    id: string
}

export function Project({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const data = useProject(project_id);
    const schema = useFetch('/schema.json');
    let record = <span>Loading ...</span>;
    if (data && schema) {
        record = (
            <div>
                <PairedDataRecord data={data} schema={schema} />
                <Link to={`/projects/${project_id}/edit`}>Edit</Link>
                <Link to={`/projects/${project_id}/clone`}>Clone</Link>
            </div>
        );
    }
    return record;
}