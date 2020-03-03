import React from 'react';
import { Button, Glyphicon } from 'react-bootstrap';
import { fetchPendingProject } from './api';
import { saveAs } from 'file-saver';

interface IProps {
    project_id: string;
    token: string;
}

export const DownloadPendingProject = ({project_id, token}: IProps) => {
    const filename = `paired_datarecord_${project_id}.json`;
    const onClick = async () => {
        const response = await fetchPendingProject(project_id, token);
        if (response.ok) {
            const blob = await response.blob();
            const file = new File([blob], filename, { type: 'application/json' });
            saveAs(file);
        } else {
            console.error(`Unable to download pending project ${project_id}`);
            console.info(response.statusText);
        }
    }

    return (
        <Button title="Download" bsStyle="link" onClick={onClick}><Glyphicon glyph="download" /></Button>
    );
}