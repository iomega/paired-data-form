import React from 'react';
import { FieldProps } from "@rjsf/core";


export const HtmlDescriptionField = ({id, description}: FieldProps) => (
    <p id={id} className="field-description" dangerouslySetInnerHTML={{__html: description}}/>
);
