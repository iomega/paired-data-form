import * as React from "react";
import { Button } from "react-bootstrap";

interface IProps {
    onLogout(): void
}

export const Logout = ({onLogout}: IProps) => {
    return (
        <Button onClick={onLogout}>logout</Button>
    );
}