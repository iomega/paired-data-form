import * as React from "react";
import { useState } from "react";
import { Redirect, RouteComponentProps } from "react-router";

import { ProjectForm } from "../ProjectForm";
import { IOMEGAPairedDataPlatform } from "../schema";
import { useProject } from "./Project";

interface TParams {
    id: string
}

export function EditProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const data = useProject(project_id);
    const [submitted, setSubmitted] = useState(false);
    const onSubmit = async (project: IOMEGAPairedDataPlatform) => {
        const url = `/api/projects/${project_id}`;
        const headers = new Headers({
            Accept: 'application/json',
            'Content-Type': 'application/json'
        });
        const init = {
            headers,
            body: JSON.stringify(project),
            method: 'POST'
        }
        await fetch(url, init);
        setSubmitted(true);
    }
    if (submitted) {
        // TODO thank submitter and explain follow up by reviewers
        return <Redirect to="/"/>;
    }
    if (!data) {
        return <span>Loading ...</span>;
    }
    return <ProjectForm onSubmit={onSubmit} formData={data}/>;
}