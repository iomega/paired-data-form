import * as React from "react";

import { Button, ButtonGroup, ButtonToolbar, Glyphicon, Alert } from "react-bootstrap";
import Form, { ISubmitEvent } from "react-jsonschema-form";
import { useState, useRef } from "react";
import CollapsibleField from "react-jsonschema-form-extras/lib/CollapsibleField";
import Ajv from "ajv";

import { useSchema, useUiSchema } from "./api";
import { ForeignKeyField } from "./fields/ForeignKeyField";
import { HtmlDescriptionField } from "./fields/HtmlDescriptionField";
import { TableField } from './fields/TableField';
import { GenomeMetabolomeLinksField } from "./fields/GenomeMetabolomeLinksField";
import { MyTitleField } from "./fields/TitleField";
import { PairedDataProject } from "./PairedDataProject";
import { IOMEGAPairedDataPlatform } from "./schema";
import { jsonDocument } from "./textTable";
import { injectForeignKeySearchMethods, validateDocument } from "./validate";
import { CheckList } from "./CheckList";

import './ProjectForm.css';

export interface IProps {
    onSubmit(project: IOMEGAPairedDataPlatform): void;
    formData?: IOMEGAPairedDataPlatform;
}

const formFields = {
    collapsible: CollapsibleField,
    foreignKey: ForeignKeyField,
    gmtable: GenomeMetabolomeLinksField,
    table: TableField,
    TitleField: MyTitleField,
    DescriptionField: HtmlDescriptionField
};

export function ProjectForm({ onSubmit, formData }: IProps) {
    const schema = useSchema();
    const uiSchema = useUiSchema();
    const [initDoc, setInitDoc] = useState(formData ? formData : undefined);
    const [validDoc, setValidDoc] = useState<IOMEGAPairedDataPlatform | undefined>(undefined);
    const [uploadError, setUploadError] = useState(false);
    const onReset = () => {
        setInitDoc(undefined);
        setValidDoc(undefined);
    }
    const onError = () => {
        setValidDoc(undefined);
    };
    const uploadRef = useRef<HTMLInputElement>(null);
    const onUpload = () => {
        uploadRef!.current!.click();
    };
    const loadExample1 = () => {
        if (uploadError) {
            setUploadError(false);
        }
        fetch('/examples/paired_datarecord_MSV000078839_example.json')
            .then(r => r.json())
            .then((r) => {
                setInitDoc(r);
                setValidDoc(undefined);
            })
            ;
    }
    const fillFormFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) {
            return;
        }
        setUploadError(false);
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                try {
                    const project: IOMEGAPairedDataPlatform = JSON.parse(reader.result as string);
                    const ajv = new Ajv();
                    const valid = ajv.validate(schema.data as object, project);
                    if (valid) {
                        setInitDoc(project);
                        setValidDoc(undefined);
                    } else {
                        console.warn(ajv.errorsText());
                        setUploadError(true);
                    }
                } catch (error) {
                    console.warn(error);
                    setUploadError(true);
                }
            }
        };
        reader.readAsText(file);
    }
    const onWrappedSubmit = ({ formData }: ISubmitEvent<IOMEGAPairedDataPlatform>) => {
        onSubmit(formData);
    }
    const formRef = useRef<Form<IOMEGAPairedDataPlatform>>(null);
    if (uiSchema.data) {
        injectForeignKeySearchMethods(uiSchema.data, formRef);
    }
    const onPreview = () => {
        const theform: any = formRef!.current;
        // The form can not be validated (excluding submit) using it's public API
        // Duplicate code from https://github.com/mozilla-services/react-jsonschema-form/blob/master/src/components/Form.js#L166-L167
        const { errors, errorSchema } = theform.validate(theform.state.formData);
        if (Object.keys(errors).length === 0) {
            theform.setState({ errors, errorSchema }, () => {
                setInitDoc(theform.state.formData);
                setValidDoc(theform.state.formData);
            });
        } else {
            theform.setState({ errors, errorSchema }, () => {
                setInitDoc(theform.state.formData);
                onError();
            });
        }
    }
    const uploadGenomeMetabolomeLinks = (gmrows: any[]) => {
        const theform: any = formRef!.current;
        const currentData: any = { ...theform.state.formData };
        const genome_metabolome_links = jsonDocument(currentData, gmrows);
        currentData.genome_metabolome_links = genome_metabolome_links;
        setInitDoc(currentData);
    };
    const formContext = {
        uploadGenomeMetabolomeLinks
    };
    if (schema.data && uiSchema.data) {
        return (
            <div className="projectform">
                <CheckList />
                <Form
                    schema={schema.data}
                    uiSchema={uiSchema.data}
                    formData={initDoc ? initDoc : undefined}
                    fields={formFields}
                    validate={validateDocument}
                    onSubmit={onWrappedSubmit}
                    onError={onError}
                    formContext={formContext}
                    ref={formRef}
                >
                    {uploadError && (
                        <Alert bsStyle="danger">Failed to parse JSON document. Try to validate the JSON document with an <a href="https://jsonschemalint.com/">online tool</a> against the <a target="_blank" href="/public/schema.json">JSON schema</a>.</Alert>
                    )}
                    <ButtonToolbar>
                        <ButtonGroup>
                            <Button onClick={loadExample1} title="Load example dataset">
                                <Glyphicon glyph="paperclip" /> Example
                            </Button>
                            <Button onClick={onUpload} title="Upload JSON file">
                                <Glyphicon glyph="upload" /> Upload
                                <input
                                    type="file"
                                    accept="application/json,.json"
                                    onChange={fillFormFromFile}
                                    ref={uploadRef}
                                    style={{ display: "none" }}
                                />
                            </Button>
                        </ButtonGroup>
                        <ButtonGroup>
                            <Button type="submit" bsStyle="primary">
                                <Glyphicon glyph="ok" /> Submit for review
                            </Button>
                            <Button bsStyle="info" onClick={onPreview}>
                                <Glyphicon glyph="eye-open" /> Preview
                            </Button>
                            <Button type="reset" onClick={onReset}>
                                <Glyphicon glyph="remove" /> Reset
                            </Button>
                        </ButtonGroup>
                    </ButtonToolbar>
                </Form>
                {validDoc && (
                    <>
                        <h3>Preview</h3>
                        <PairedDataProject
                            project={{ _id: 'preview_id', project: validDoc }}
                            schema={schema.data}
                        />
                    </>
                )}
            </div>
        );
    } else {
        if (schema.error) {
            return <div>Error loading JSON schema: {schema.error.message}</div>;
        }
        if (uiSchema.error) {
            return <div>Error loading UI schema: {uiSchema.error.message}</div>;
        }
        return <span>Loading ...</span>;
    }
}