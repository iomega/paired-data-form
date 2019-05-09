import * as React from "react";
import { Button } from "react-bootstrap";

export interface IProps {
    onLogout(): void
}

export const Logout = ({onLogout}: IProps) => {
    return (
        <Button onClick={onLogout}>logout</Button>
    );
}