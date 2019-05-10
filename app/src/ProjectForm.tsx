import * as React from "react";
import { IOMEGAPairedDataPlatform } from "./schema";
import { useFetch } from "./useFetch";
import { Button, ButtonGroup, ButtonToolbar, Glyphicon } from "react-bootstrap";

import { injectForeignKeySearchMethods, validateDocument } from "./validate";
import CollapsibleField from "react-jsonschema-form-extras/lib/CollapsibleField";

import { ForeignKeyField } from "./ForeignKeyField";
import { GenomeMetabolomeLinksField } from './GenomeMetabolomeLinksField';

import Form, { ISubmitEvent } from "react-jsonschema-form";
import { useState, useRef } from "react";
import { PairedDataProject } from "./PairedDataProject";

import './ProjectForm.css';
import { jsonDocument } from "./textTable";

export interface IProps {
    onSubmit(project: IOMEGAPairedDataPlatform): void;
    formData?: IOMEGAPairedDataPlatform;
}

const formFields = {
    collapsible: CollapsibleField,
    foreignKey: ForeignKeyField,
    gmarray: GenomeMetabolomeLinksField,
};

export function ProjectForm({ onSubmit, formData }: IProps) {
    const schema = useFetch('/schema.json')
    const uiSchema = useFetch('/uischema.json');
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
    if (uiSchema) {
        injectForeignKeySearchMethods(uiSchema, formRef);
    }
    const onPreview = () => {
        const theform: any = formRef!.current;
        // The form can not be validated (excluding submit) using it's public API
        // Duplicate code from https://github.com/mozilla-services/react-jsonschema-form/blob/master/src/components/Form.js#L166-L167
        const { errors,errorSchema } = theform.validate(theform.state.formData);
        if (Object.keys(errors).length === 0) {
            setValidDoc(theform.state.formData);
        } else {
            theform.setState({errors, errorSchema}, () => {
                onError();
            });
        }
    }
    const uploadGenomeMetabolomeLinks = (rows: any[]) => {
        const doc = jsonDocument(schema, rows);
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
            submitter_institution: undefined,
            submitter_name: undefined,
            };
        }
        if (!currentData.metabolomics) {
            currentData.metabolomics = {
                GNPSMassIVE_ID: undefined,
                 MaSSIVE_URL: undefined
            }
        }
        setInitDoc(currentData);
    };
    const formContext = {
        uploadGenomeMetabolomeLinks
    };
    if (schema && uiSchema) {
        return (
            <div className="projectform">
                <Form
                    schema={schema}
                    uiSchema={uiSchema}
                    formData={initDoc}
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
                            data={validDoc}
                            schema={schema}
                        />
                    </>
                )}
            </div>
        );
    } else {
        return <span>Loading ...</span>;
    }
}