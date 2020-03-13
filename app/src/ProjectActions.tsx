import * as React from "react";

import { Button, Glyphicon, ButtonGroup } from "react-bootstrap";
import { Link} from "react-router-dom";
import { getProjectJSONUrl } from "./api";

interface IProps {
    data_url: string;
    filename: string;
    project_id: string;
    inreview: boolean;
}

export const ProjectActions = ({data_url, filename, project_id, inreview}: IProps) => {
    const project_url = getProjectJSONUrl(project_id);
    // In development mode the `npm start` watch server does not proxy when Accept header includes text/html.
    // like a downloading a file from the api server in a web browser so use a data url when in dev mode.
    const is_dev = process.env.NODE_ENV === 'development';
    const is_preview = project_id === 'preview_id';
    return (
        <ButtonGroup style={{marginBottom: '20px'}}>
            { (inreview || is_dev || is_preview) ?
                <Button href={data_url} download={filename} ><Glyphicon glyph="download" /> Download</Button>
                :
                <Button href={project_url} download={filename} ><Glyphicon glyph="download" /> Download</Button>
            }
            { !is_preview &&
                <Link title="View history of project" className="btn btn-default" to={`/projects/${project_id}/history`}><Glyphicon glyph="sort" /> History</Link>
            }
            { !inreview && !is_preview &&
                <>
                    <Link title="Edit project" className="btn btn-default" to={`/projects/${project_id}/edit`}><Glyphicon glyph="edit" /> Edit</Link>
                    <Link title="Create new project based on this one" className="btn btn-default" to={`/projects/${project_id}/clone`}><Glyphicon glyph="retweet"/> Clone</Link>
                </>
            }
        </ButtonGroup>
    );
}