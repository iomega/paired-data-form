import * as React from "react";

import { Glyphicon } from "react-bootstrap";

import { SubmitterInformation as Personal } from './schema';
import { Orcid } from "./Orcid";

interface IProps {
    project_id: string
    personal: Personal
}

export const SubmitterInformation = ({ project_id, personal }: IProps) => {
    const subject = "Regarding paired omics data platform project: " + project_id;
    const submitter_mailto = "mailto:" + personal.submitter_email + "?subject=" + subject;
    const pi_mailto = "mailto:" + personal.PI_email + "?subject=" + subject;
    return (
        <ul>
            <li>
                Submitter: {personal.submitter_name}
                &nbsp;<a title="Contact submitter" href={submitter_mailto}><Glyphicon glyph="envelope" /></a>
                &nbsp;<Orcid iD={personal.submitter_orcid!} />
            </li>
            {personal.submitter_name_secondary &&
                <li>
                    Secondary submitter: {personal.submitter_name_secondary}
                    &nbsp;<a title="Contact submitter" href={"mailto:" + personal.submitter_email_secondary + "?subject=" + subject}><Glyphicon glyph="envelope" /></a>
                </li>
            }
            <li>
                Principal investigator: {personal.PI_name}
                &nbsp;<a title="Contact Principal investigator" href={pi_mailto}><Glyphicon glyph="envelope" /></a>
                &nbsp;of {personal.PI_institution}
            </li>
        </ul>
    );
}