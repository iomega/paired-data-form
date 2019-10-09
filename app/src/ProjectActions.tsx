import * as React from "react";

import { Button, Glyphicon, ButtonGroup } from "react-bootstrap";
import { Link} from "react-router-dom";

interface IProps {
    data_url: string;
    filename: string;
    project_id: string;
}

export const ProjectActions = ({data_url, filename, project_id}: IProps) => {
    
    return (
        <ButtonGroup style={{marginBottom: '20px'}}>
            <Button href={data_url} download={filename} ><Glyphicon glyph="download" /> Download</Button>
            <Link title="View history of project" className="btn btn-default" to={`/projects/${project_id}/history`}><Glyphicon glyph="sort" /> History</Link>
            <Link title="Edit project" className="btn btn-default" to={`/projects/${project_id}/edit`}><Glyphicon glyph="edit" /> Edit</Link>
            <Link title="Create new project based on this one" className="btn btn-default" to={`/projects/${project_id}/clone`}><Glyphicon glyph="retweet"/> Clone</Link>
        </ButtonGroup>
    );
}