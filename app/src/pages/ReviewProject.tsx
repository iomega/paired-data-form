import * as React from "react";
import { useContext, useState } from "react";
import { RouteComponentProps, Redirect } from "react-router";
import { Decide } from "../Decide";
import { PairedDataProject } from "../PairedDataProject";
import { AuthContext } from "../auth";
import { usePendingProject, denyPendingProject, approvePendingProject, useSchema } from "../api";

interface TParams {
    id: string
}

export function ReviewProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const project = usePendingProject(project_id);
    const schema = useSchema();
    const { token } = useContext(AuthContext);
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
    if (project.loading || schema.loading) {
        return <div>Loading ...</div>;
    }
    if (project.error && !project.data) {
        return <div>Error: {project.error.message}</div>;
    }
    if (schema.error && !schema.data) {
        return <div>Error: {schema.error.message}</div>;
    }
    return (
        <>
            <Decide onDeny={onDeny} onApprove={onApprove} />
            <PairedDataProject project={project.data!} schema={schema.data} inreview={true} />
            <Decide onDeny={onDeny} onApprove={onApprove} />
        </>
    );
}