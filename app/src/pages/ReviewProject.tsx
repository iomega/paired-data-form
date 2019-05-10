import * as React from "react";
import { useContext, useState } from "react";
import { RouteComponentProps, Redirect } from "react-router";
import { Decide } from "../Decide";
import { PairedDataRecord } from "../PairedDataRecord";
import { useFetch } from "../useFetch";
import { AuthContext } from "../auth";
import { usePendingProject, denyPendingProject, approvePendingProject } from "../api";

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
        await denyPendingProject(project_id, token);
        setReviewed(true);
    }
    const onApprove = async () => {
        await approvePendingProject(project_id, token);
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