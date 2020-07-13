import * as React from "react";

import { Helmet } from "react-helmet";
import { useState } from "react";
import { Link, RouteComponentProps } from "react-router-dom";
import { ButtonGroup, Radio } from "react-bootstrap";
import { unifiedDiff } from 'difflib';
import { Diff2Html } from "diff2html";
import "diff2html/dist/diff2html.min.css";

import { useProjectHistory } from "../api";

interface TParams {
    id: string
}

const style = { padding: '10px' };

export function HistoryProject({ match }: RouteComponentProps<TParams>) {
    const project_id = match.params.id;
    const project_history = useProjectHistory(project_id);
    const [previous, setPrevious] = useState(0);
    if (project_history.loading) {
        return <div style={style}>Loading...</div>;
    }
    if (!project_history.data && project_history.error) {
        return <div style={style}>Error: {project_history.error.message}</div>;
    }
    const archived = project_history.data!.archived;
    const current = project_history.data!.current;
    const nav = (
        <ButtonGroup>
            <Link className="btn btn-default" to={`/projects/${project_id}`}>Back to project view</Link>
        </ButtonGroup>
    );
    if (archived.length === 0) {
        return (
            <>
                <span>Project has no history. It has not been edited after submission</span>
                {nav}
            </>
        );
    }
    const revisions = archived.map((d, i) => {
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
    const prev_id = previous === -1 ? project_id : archived[previous][0];
    const prev_project = previous === -1 ? current : archived[previous][1];
    const diff = unifiedDiff(
        JSON.stringify(prev_project, null, 4).split(/\n/),
        JSON.stringify(current, null, 4).split(/\n/),
        {
            fromfile: prev_id,
            tofile: project_id,
            lineterm: ''
        }
    ).join('\n');
    const htmlified_diff = Diff2Html.getPrettyHtml(
        diff, {
        outputFormat: 'side-by-side'
    }
    );
    return (
        <div style={style}>
            <Helmet>
                <link rel="canonical" href={`https://pairedomicsdata.bioinformatics.nl/projects/${project_id}`} />
            </Helmet>
            <h3>
                Compare <Link to={`/projects/${project_id}`}>{project_id}</Link> project to previous revision
            </h3>
            <ul>
                {revisions}
            </ul>
            <div dangerouslySetInnerHTML={{ __html: htmlified_diff }} />
            {nav}
        </div>
    );
}
