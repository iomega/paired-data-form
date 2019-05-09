import * as React from "react";
import { useState } from "react";
import { Redirect } from "react-router";

import { ProjectForm } from "../ProjectForm";
import { IOMEGAPairedDataPlatform } from "../schema";

export function AddProject() {
    const [submitted, setSubmitted] = useState(false);
    const onSubmit = async (project: IOMEGAPairedDataPlatform) => {
        const url = '/api/projects';
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
    return <ProjectForm onSubmit={onSubmit}/>;
}