import * as React from "react";
import { Redirect, RouteComponentProps } from "react-router";
import { Button, Modal } from "react-bootstrap";

import { ProjectForm } from "../ProjectForm";
import { useProject, useSubmitProject } from "../api";


interface TParams {
    id: string
}

export function EditProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const project = useProject(project_id);
    const [submitted, onSubmit] = useSubmitProject(project_id);
    if (submitted) {
        return (
            <Modal.Dialog>
            <Modal.Header>
              <Modal.Title>Modal title</Modal.Title>
            </Modal.Header>
        
            <Modal.Body>One fine body...</Modal.Body>
        
            <Modal.Footer>
              <Button>Close</Button>
              <Button bsStyle="primary">Save changes</Button>
            </Modal.Footer>
          </Modal.Dialog>
        );
        // TODO thank submitter and explain follow up by reviewers
        return <Redirect to="/"/>;
    }
    if (project.loading) {
        return <span>Loading...</span>;
    }
    if (!project.data) {
        return <span>Fetch failure: {project.error}</span>;
    }
    return <ProjectForm onSubmit={onSubmit} formData={project.data.project}/>;
}