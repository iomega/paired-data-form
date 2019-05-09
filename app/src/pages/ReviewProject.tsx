import * as React from "react";
import { useContext, useState, useEffect } from "react";
import { Decide } from "../Decide";

import { PairedDataRecord } from "../PairedDataRecord";
import { useFetch } from "../useFetch";
import { AuthContext } from "../auth";
import { IOMEGAPairedDataPlatform } from "../schema";
import { RouteComponentProps, Redirect } from "react-router";
import { deny } from "../review";

const usePendingProject = (project_id: string) => {
    const { token } = useContext(AuthContext);
    const headers = new Headers({
        Accept: 'application/json',
        Authorization: `Bearer ${token}`
    });
    const init = { headers };
    const url = `/api/pending/projects/${project_id}`;
    const [data, setData] = useState<IOMEGAPairedDataPlatform | null>(null);
    async function fetchData() {
        const response = await fetch(url, init);
        const json = await response.json();
        setData(json);
    }
    useEffect(() => { fetchData(); }, [url]);
    return data;
};

interface TParams {
    id: string
}

export function ReviewProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const data = usePendingProject(project_id);
    const schema = useFetch('/schema.json');
    const { token } = useContext(AuthContext);
    let record = <span>Loading ...</span>;
    const [reviewed, setReviewed] = useState(false);
    const onDeny = async () => {
        await deny(project_id, token);
        setReviewed(true);
    }
    const onApprove = async () => {
        await deny(project_id, token);
        setReviewed(true);
    }
    if (reviewed) {
        return <Redirect to="/pending" />;
    }
    if (data && schema) {
        record = (
            <div>
                <Decide onDeny={onDeny} onApprove={onApprove} />
                <PairedDataRecord data={data} schema={schema} />
                <Decide onDeny={onDeny} onApprove={onApprove} />
            </div>
        );
    }
    return record;
}