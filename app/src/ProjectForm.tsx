import * as React from "react";

import { Button, ButtonGroup, ButtonToolbar, Glyphicon } from "react-bootstrap";
import Form, { ISubmitEvent } from "react-jsonschema-form";
import { useState, useRef } from "react";
import CollapsibleField from "react-jsonschema-form-extras/lib/CollapsibleField";

import { useSchema, useUiSchema } from "./api";
import { ForeignKeyField } from "./fields/ForeignKeyField";
import { TableField } from './fields/TableField';
import { GenomeMetabolomeLinksField } from "./fields/GenomeMetabolomeLinksField";
import { MyTitleField } from "./fields/TitleField";
import { PairedDataProject } from "./PairedDataProject";
import { IOMEGAPairedDataPlatform } from "./schema";
import { jsonDocument } from "./textTable";
import { injectForeignKeySearchMethods, validateDocument } from "./validate";

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
};

export function ProjectForm({ onSubmit, formData }: IProps) {
    const schema = useSchema();
    const uiSchema = useUiSchema();
    const [initDoc, setInitDoc] = useState(formData ? formData : undefined);
    const [validDoc, setValidDoc] = useState<IOMEGAPairedDataPlatform | undefined>(undefined);
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
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                const project: IOMEGAPairedDataPlatform = JSON.parse(reader.result as string);
                delete project.id;
                setInitDoc(project);
                setValidDoc(undefined);
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
        validateDocument(theform.state.formData, errors);
        if (Object.keys(errors).length === 0) {
            theform.setState({errors, errorSchema}, () => {
                setInitDoc(theform.state.formData);
                setValidDoc(theform.state.formData);
            });
        } else {
            theform.setState({errors, errorSchema}, () => {
                setInitDoc(theform.state.formData);
                onError();
            });
        }
    }
    const uploadGenomeMetabolomeLinks = (rows: any[]) => {
        const doc = jsonDocument(schema.data, rows);
        const theform: any = formRef!.current;
        const currentData: any = {...theform.state.formData};
        currentData.genomes = doc.genomes;
        currentData.experimental = doc.experimental;
        currentData.genome_metabolome_links = doc.genome_metabolome_links;
        if (!currentData.personal) {
            currentData.personal = {
            PI_email: undefined,
            PI_institution: undefined,
            PI_name: undefined,
            submitter_email: undefined,
            submitter_orcid: undefined,
            submitter_name: undefined,
            };
        }
        if (!currentData.metabolomics) {
            currentData.metabolomics = {
                project: {
                    GNPSMassIVE_ID: undefined,
                    MaSSIVE_URL: undefined
                }
            }
        }
        setInitDoc(currentData);
    };
    const formContext = {
        uploadGenomeMetabolomeLinks
    };
    if (schema.data && uiSchema.data) {
        return (
            <div className="projectform">
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
                            project={{ _id: 'preview_id', project:validDoc}}
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