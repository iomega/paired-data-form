import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { useState, useEffect } from "react";

import { PairedDataRecord } from "../PairedDataRecord";
import { useFetch } from "../useFetch";
import { IOMEGAPairedDataPlatform } from "../schema";

const useProject = (project_id: string): IOMEGAPairedDataPlatform | null => {
    const url = '/api/projects/' + project_id;
    const [data, setData] = useState(null);
    async function fetchData() {
        const response = await fetch(url);
        const json = await response.json();
        setData(json);
    }
    useEffect(() => { fetchData(); }, [url]);
    return data;
};

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