import * as React from "react";

import { tsvParse } from 'd3-dsv';
import { Button, Glyphicon } from 'react-bootstrap';
import { FieldProps } from 'react-jsonschema-form';

import { TableField } from "./TableField";

export const GenomeMetabolomeLinksField = (props: FieldProps) => {
    const uploadRef = React.useRef<HTMLInputElement>(null);

    function onClick() {
        if (uploadRef.current) {
            uploadRef.current.click();
        }
    }

    function fillLinksFromFile(event: React.ChangeEvent<HTMLInputElement>) {
        if (!event.target.files) {
            return;
        }
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                const rows = tsvParse(reader.result as string);
                props.formContext.uploadGenomeMetabolomeLinks(rows);
            }
        };
        reader.readAsText(file);
    }

    return (
        <>
            <TableField {...props} />
            <Button onClick={onClick} title="Upload links from tab delimited file, will replace existing links, (meta)genomes and metabolomics experimental details">
                <Glyphicon glyph="upload" /> Upload links
                <input
                    type="file"
                    accept="text/tab-separated-values,.tsv,.txt"
                    onChange={fillLinksFromFile}
                    ref={uploadRef}
                    style={{ display: "none" }}
                />
            </Button>
        </>
    );
}
