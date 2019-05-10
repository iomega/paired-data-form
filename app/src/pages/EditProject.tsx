import * as React from "react";
import { Redirect, RouteComponentProps } from "react-router";

import { ProjectForm } from "../ProjectForm";
import { useProject, useSubmitProject } from "../api";

interface TParams {
    id: string
}

export function EditProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const data = useProject(project_id);
    const [submitted, onSubmit] = useSubmitProject(project_id);
    if (submitted) {
        // TODO thank submitter and explain follow up by reviewers
        return <Redirect to="/"/>;
    }
    if (!data) {
        return <span>Loading ...</span>;
    }
    return <ProjectForm onSubmit={onSubmit} formData={data}/>;
}