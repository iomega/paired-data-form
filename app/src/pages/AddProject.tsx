import * as React from "react";
import { Button, Modal, Glyphicon } from "react-bootstrap";
import { Link } from "react-router-dom";

import { ProjectForm } from "../ProjectForm";
import { useSubmitProject } from "../api";
import { record2dataUrl } from "../record2dataUrl";

export function AddProject() {
  const [submitted, onSubmit, error, rollback] = useSubmitProject();
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
    const filename = `paired_datarecord_preview_id.json`;
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
          <Button href="/add"><Glyphicon glyph="plus" /> Add another project</Button>
          <Link title="Home" className="btn btn-default btn-primary" to={`/`}><Glyphicon glyph="home" /> Back to home page</Link>
        </Modal.Footer>
      </Modal.Dialog>
    );
  }
  return (
    <>
      <ProjectForm onSubmit={onSubmit} />
      {modal}
    </>
  );
}
