import * as React from "react";
import { Redirect } from "react-router";

import { ProjectForm } from "../ProjectForm";
import { useSubmitProject } from "../api";

export function AddProject() {
    const [submitted, onSubmit] = useSubmitProject();
    if (submitted) {
        // TODO thank submitter and explain follow up by reviewers
        return <Redirect to="/"/>;
    }
    return <ProjectForm onSubmit={onSubmit}/>;
}
