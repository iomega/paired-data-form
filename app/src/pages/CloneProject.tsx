import * as React from "react";
import { Redirect, RouteComponentProps } from "react-router";

import { ProjectForm } from "../ProjectForm";
import { useProject, useSubmitProject } from "../api";

interface TParams {
    id: string
}

export function CloneProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const project = useProject(project_id);
    const [submitted, onSubmit] = useSubmitProject();
    if (project.loading) {
        return <span>Loading...</span>;
    }
    if (!project.data) {
        return <span>Fetch failure: {project.error}</span>;
    }
    if (submitted) {
        // TODO thank submitter and explain follow up by reviewers
        return <Redirect to="/"/>;
    }
    return <ProjectForm onSubmit={onSubmit} formData={project.data.project}/>;
}