import * as React from "react";
import { RouteComponentProps } from "react-router";
import { Button, Modal, Glyphicon } from "react-bootstrap";
import { Link } from "react-router-dom";

import { ProjectForm } from "../ProjectForm";
import { useEnrichedProject, useSubmitProject } from "../api";
import { record2dataUrl } from "../record2dataUrl";

interface TParams {
    id: string
}

export function CloneProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const project = useEnrichedProject(project_id);
    const [submitted, onSubmit, error, rollback] = useSubmitProject();
    if (project.loading) {
        return <span>Loading...</span>;
    }
    if (!project.data) {
        return <span>Fetch failure: {project.error!.message}</span>;
    }
    let modal = <></>;
    if (error) {
        modal = (
            <Modal.Dialog>
                <Modal.Header>
                    <Modal.Title>Failed submission</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {error}
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={() => rollback()}>Go back</Button>
                </Modal.Footer>
            </Modal.Dialog>
        );
    }
    if (submitted.project) {
        const filename = `paired_datarecord_${submitted._id}.json`;
        const data_url = record2dataUrl(submitted.project);
        modal = (
            <Modal.Dialog>
                <Modal.Header>
                    <Modal.Title>Project has been successully submitted for review</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <p>A reviewer will approve or disapprove it as soon as possible.</p>
                    <p>We highly recommend to download your project, to correct and resubmit any disapproved submissions.</p>
                </Modal.Body>

                <Modal.Footer>
                    <Button href={data_url} download={filename} ><Glyphicon glyph="download" /> Download</Button>
                    <Link title="Home" className="btn btn-default" to={`/projects/${project_id}`}><Glyphicon glyph="list-alt" /> Back to project page</Link>
                    <Link title="Home" className="btn btn-default btn-primary" to={`/`}><Glyphicon glyph="home" /> Back to home page</Link>
                </Modal.Footer>
            </Modal.Dialog>
        );
    }
    return (
        <>
            <ProjectForm onSubmit={onSubmit} formData={project.data.project} />
            {modal}
        </>
    );
}