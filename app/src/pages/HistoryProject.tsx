import * as React from "react";
import { useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ButtonGroup, Radio } from "react-bootstrap";
import { ReactGhLikeDiff } from 'react-gh-like-diff';

import 'react-gh-like-diff/lib/diff2html.min.css';

import { useProjectHistory } from "../api";

interface TParams {
    id: string
}

const style = {padding: '10px'};

export function HistoryProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const project_history = useProjectHistory(project_id);
    const [previous, setPrevious] = useState(0);
    if (!project_history) {
        return <span>Loading ...</span>;
    }
    const nav = (
        <ButtonGroup>
            <Link className="btn btn-default" to={`/projects/${project_id}`}>Back to project view</Link>
        </ButtonGroup>
    );
    if (project_history.archived.length === 0) {
        return (
            <>
                <span>Project has no history. It has not been edited after submission</span>
                {nav}
            </>
        );
    }
    const revisions = project_history.archived.map((d, i) => {
        const prev_project_id = d[0];
        const checked = previous === i;
        return (
            <li key={prev_project_id}>
                <Radio inline checked={checked} onChange={() => setPrevious(i)}>
                    {prev_project_id}
                </Radio>
            </li>
        );
    });
    const curr_project = project_history.current;
    const prev_id = previous === -1 ? project_id : project_history.archived[previous][0];
    const prev_project = previous === -1 ? curr_project : project_history.archived[previous][1];
    return (
        <div style={style}>
            History of <Link to={`/projects/${project_id}`}>{project_id}</Link> project.
            <h2>Revisions</h2>
            {revisions}
            (Latest revision first)
            <h2>Difference</h2>
            <ReactGhLikeDiff
                options={{
                    originalFileName: prev_id,
                    updatedFileName: project_id,
                }}
                past={JSON.stringify(prev_project, null, 4)}
                current={JSON.stringify(curr_project, null, 4)}
            />
            {nav}
        </div>
    );
}