import * as React from "react";
import Form, { ISubmitEvent } from "react-jsonschema-form";
import { JSONSchema6 } from "json-schema";

export interface Credentials {
    username: string;
    password: string;
}

export interface IProps {
    onLogin(credentials: Credentials): void
}

const schema: JSONSchema6 = {
    title: 'Reviewing pending projects requires login',
    type: 'object',
    required: ['username', 'password'],
    properties: {
        username: {type: "string", title: 'Username', default: 'admin'},
        password: {type: "string", title: 'Password'}
    }
};

export const Login = ({onLogin}: IProps) => {
    const onSubmit = (event: ISubmitEvent<Credentials>) => {
        onLogin(event.formData);
    };
    return (
        <Form onSubmit={onSubmit} schema={schema}/>
    );
}