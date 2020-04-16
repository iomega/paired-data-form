import * as React from "react";
import Form, { ISubmitEvent } from "@rjsf/core";
import { JSONSchema7 } from "json-schema";
import { Label } from "react-bootstrap";

export interface Credentials {
    username: string;
    password: string;
}

export interface IProps {
    onLogin(credentials: Credentials): void
    error: string;
}

const schema: JSONSchema7 = {
    title: 'Reviewing pending projects requires login',
    type: 'object',
    required: ['username', 'password'],
    properties: {
        username: { type: "string", title: 'Username', default: 'admin' },
        password: { type: "string", title: 'Password' }
    }
};

const uiSchema = {
    password: {
        "ui:widget": "password"
    }
}

export const Login = ({ onLogin, error }: IProps) => {
    const onSubmit = (event: ISubmitEvent<Credentials>) => {
        onLogin(event.formData);
    };
    return (
        <>
            {error && <Label bsStyle="danger">{error}</Label>}
            <Form onSubmit={onSubmit} schema={schema} uiSchema={uiSchema} />
        </>
    );
}