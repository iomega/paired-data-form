import * as React from "react";

import { useState, useRef } from "react";
import { tsvParse } from 'd3-dsv';
import { Button, Glyphicon, Alert } from 'react-bootstrap';
import { FieldProps } from '@rjsf/core';

import { TableField } from "./TableField";

export const GenomeMetabolomeLinksField = (props: FieldProps) => {
    const uploadRef = useRef<HTMLInputElement>(null);
    const [uploadError, setUploadError] = useState('');

    function onClick() {
        if (uploadRef.current) {
            uploadRef.current.click();
        }
    }

    function fillLinksFromFile(event: React.ChangeEvent<HTMLInputElement>) {
        setUploadError('');
        if (!event.target.files || event.target.files.length === 0) {
            setUploadError('No file selected');
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            const rows = tsvParse(reader.result as string).map(d => d);
            try {
                props.formContext.uploadGenomeMetabolomeLinks(rows);
            } catch (error) {
                setUploadError(error.message);
            }
        };
        reader.onerror = () => setUploadError('Loading file failed: ' + reader.error);
        reader.readAsText(file);
    }
    return (
        <>
            <TableField {...props} />
            <Button onClick={onClick} title="Upload links from tab delimited file, will replace existing links">
                <Glyphicon glyph="upload" /> Upload links
                <input
                    type="file"
                    accept="text/tab-separated-values,.tsv,.txt"
                    onChange={fillLinksFromFile}
                    ref={uploadRef}
                    style={{ display: "none" }}
                    data-testid="links-upload-input"
                />
            </Button>
            {uploadError && <Alert bsStyle="danger">{uploadError}</Alert>}
        </>
    );
}
