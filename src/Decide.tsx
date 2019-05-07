import * as React from "react";
import { ButtonGroup, Button, Glyphicon } from "react-bootstrap";

interface IProps {
    onApprove(): void
    onDeny(): void
}

export const Decide = ({onApprove, onDeny}: IProps) => {
    return (
        <ButtonGroup>
            <Button bsStyle="success" onClick={onApprove}>
                <Glyphicon glyph="ok" /> Approve
            </Button>
            <Button bsStyle="danger" onClick={onDeny}>
                <Glyphicon glyph="remove" /> Deny
            </Button>
        </ButtonGroup>
    );
}