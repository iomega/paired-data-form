import * as React from "react";

import { JSONSchema6 } from "json-schema";
import { Button, ButtonGroup, ButtonToolbar, Glyphicon } from "react-bootstrap";
import Form, { ISubmitEvent } from "react-jsonschema-form";
import CollapsibleField from "react-jsonschema-form-extras/lib/CollapsibleField";

import { ForeignKeyField } from "./ForeignKeyField";
import { GenomeMetabolomeLinksField } from './GenomeMetabolomeLinksField';
import { PairedDataRecord } from "./PairedDataRecord";

import "./App.css";
import { jsonDocument } from './textTable';
import { injectForeignKeySearchMethods, validateDocument } from "./validate";

export interface IState {
  schema: JSONSchema6;
  uiSchema: any;
  initDoc: any;
  validDoc: any;
}

const formFields = {
  collapsible: CollapsibleField,
  foreignKey: ForeignKeyField,
  gmarray: GenomeMetabolomeLinksField,
};

export class App extends React.Component<{}, IState> {
  public state: IState = { schema: {}, uiSchema: {}, initDoc: {}, validDoc: undefined };
  private uploadRef: React.RefObject<HTMLInputElement>;
  private formRef: React.RefObject<Form<any>>;

  constructor(props: {}) {
    super(props);
    this.uploadRef = React.createRef();
    this.formRef = React.createRef();
  }

  public componentDidMount() {
    fetch("schema.json")
      .then(r => r.json())
      .then(schema => {
        // react-jsonschema-form does not like $schema key in the schema, it stops validating
        delete schema['$schema'];
        return schema;
      })
      .then(schema => this.setState({ schema }));
    fetch("uischema.json")
      .then(r => r.json())
      .then(uiSchema => {
        injectForeignKeySearchMethods(uiSchema, this);
        this.setState({ uiSchema });
      });
  }
  
  public onSubmit = ({ formData }: ISubmitEvent<object>) => {
    this.setState({ validDoc: formData, initDoc: formData });
  };

  public onReset = () => {
    this.setState({ initDoc: {}, validDoc: undefined });
  }

  public uploadGenomeMetabolomeLinks = (rows: any[]) => {
    const doc = jsonDocument(this.state.schema, rows);
    const formData: any = this.state.initDoc;
    formData.genomes = doc.genomes;
    formData.experimental = doc.experimental;
    formData.genome_metabolome_links = doc.genome_metabolome_links;
    if (!formData.personal) {
      formData.personal = {
        PI_email: undefined,
        PI_institution: undefined,
        PI_name: undefined,
        submitter_email: undefined,
        submitter_institution: undefined,
        submitter_name: undefined,
      };
    }
    if (!formData.metabolomics) {
      formData.metabolomics = {
        GNPSMassIVE_ID: undefined,
        MaSSIVE_URL: undefined
      }
    }
    this.fillForm(formData);
  }

  public render() {
    const formContext = {
      uploadGenomeMetabolomeLinks: this.uploadGenomeMetabolomeLinks
    };
    return (
      <div className="App">
        {Object.keys(this.state.schema).length > 0 &&
          Object.keys(this.state.uiSchema).length > 0 && (
            <Form
              schema={this.state.schema}
              uiSchema={this.state.uiSchema}
              fields={formFields}
              formData={this.state.initDoc}
              onSubmit={this.onSubmit}
              validate={validateDocument}
              formContext={formContext}
              ref={this.formRef}
            >
              <ButtonToolbar>
                <ButtonGroup>
                  <Button onClick={this.loadExample1} title="Load example dataset">
                    <Glyphicon glyph="paperclip" /> Example
                  </Button>
                  <Button onClick={this.onUpload} title="Upload JSON file">
                    <Glyphicon glyph="upload" /> Upload
                    <input
                      type="file"
                      accept="application/json,.json"
                      onChange={this.fillFormFromFile}
                      ref={this.uploadRef}
                      style={{ display: "none" }}
                    />
                  </Button>
                </ButtonGroup>
                <ButtonGroup>
                  <Button type="submit" bsStyle="primary">
                    <Glyphicon glyph="ok" /> Save
                  </Button>
                  <Button type="reset" onClick={this.onReset}>
                    <Glyphicon glyph="remove" /> Reset
                  </Button>
                </ButtonGroup>
              </ButtonToolbar>
            </Form>
          )}
        {this.state.validDoc && (
          <PairedDataRecord
            data={this.state.validDoc}
            schema={this.state.schema}
          />
        )}
      </div>
    );
  }
 
  public onUpload = () => {
    if (this.uploadRef.current) {
      this.uploadRef.current.click();
    }
  };

  public fillFormFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return;
    }
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = evt => {
      if (reader.result) {
        const formData = JSON.parse(reader.result as string);
        this.fillForm(formData);
      }
    };
    reader.readAsText(file);
  };


  public loadExample1 = () => {
    fetch('examples/paired_datarecord_MSV000078839_example.json')
      .then(r => r.json())
      .then(this.fillForm);
  }

  public fillForm = (doc: any) => {
    this.setState({ initDoc: doc, validDoc: undefined }, () => {
      const form = this.formRef.current;
      if (form) {
        // dts for form does not include submit(), but is documented at
        // https://react-jsonschema-form.readthedocs.io/en/latest/#submit-form-programmatically
        (form as any).submit();
      }
    });
  }
}
