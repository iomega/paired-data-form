import * as React from "react";

import { JSONSchema6 } from "json-schema";
import { Button, ButtonGroup, Glyphicon } from 'react-bootstrap';
import Form, { ISubmitEvent } from "react-jsonschema-form";
import CollapsibleField from "react-jsonschema-form-extras/lib/CollapsibleField";
import { ForeignKeyField } from './ForeignKeyField';

import "./App.css";

interface IState {
  schema: JSONSchema6;
  uiSchema: any;
  formData: object;
}

const formFields = {
  collapsible: CollapsibleField,
  foreignKey: ForeignKeyField,
};

class App extends React.Component<{}, IState> {
  public state: IState = { schema: {}, uiSchema: {}, formData: {} };
  public rawFormData: any = {};

  public componentDidMount() {
    fetch("schema.json")
      .then(r => r.json())
      .then(schema => this.setState({ schema }));
    fetch("uischema.json")
      .then(r => r.json())
      .then(uiSchema => {
        // inject foreign key search method
        uiSchema.Genome_Metabolome_links.items.Genome_Metagenome_ID.foreignKey.search = this.searchLabels.bind(this);
        uiSchema.Genome_Metabolome_links.items.Sample_preparation_label.foreignKey.search = this.searchLabels.bind(this);
        uiSchema.Genome_Metabolome_links.items.Extraction_method_label.foreignKey.search = this.searchLabels.bind(this);
        uiSchema.Genome_Metabolome_links.items.Instrumentation_method_label.foreignKey.search = this.searchLabels.bind(this);
        this.setState({ uiSchema });
      });
  }

  public searchLabels = (url: string) => {
    if (Object.keys(this.rawFormData.data_to_link).length === 0) {
      return Promise.reject(new Error('Missing data to link'));
    }
    if (url === 'Genome_Metagenome_ID') {
      if (this.rawFormData.data_to_link['metagenome_genome sequence_assemblies'] === undefined) {
        return Promise.resolve([]);
      }

      const labels = this.rawFormData.data_to_link['metagenome_genome sequence_assemblies'].map(
        (r: any) => r.GenBank_accession || r.RefSeq_accession || r.ENA_NCBI_accession || r.MGnify_accession
      );
      return Promise.resolve(labels);
    } else if (url === 'Sample_preparation_Method') {
      if (this.rawFormData.data_to_link.Experimental_details.Sample_Preparation === undefined) {
        return Promise.resolve([]);
      }

      const labels = this.rawFormData.data_to_link.Experimental_details.Sample_Preparation.map(
        (r: any) => r.Sample_preparation_Method
      );
      return Promise.resolve(labels);
    } else if (url === 'Extraction_method_label') {
      if (this.rawFormData.data_to_link.Experimental_details['Extraction Methods'] === undefined) {
        return Promise.resolve([]);
      }

      const labels = this.rawFormData.data_to_link.Experimental_details['Extraction Methods'].map((r: any) => r.Extraction_Method);
      return Promise.resolve(labels);
    } else if (url === 'Instrumentation_method_label') {
      if (this.rawFormData.data_to_link.Experimental_details['Instrumentation Methods'] === undefined) {
        return Promise.resolve([]);
      }

      const labels = this.rawFormData.data_to_link.Experimental_details['Instrumentation Methods'].map((r: any) => r.Instrumentation_Method);
      return Promise.resolve(labels);
    }
    return Promise.reject(new Error('Unknown link'));
  }

  public onSubmit = ({ formData }: ISubmitEvent<object>) => {
    this.setState({ formData });
  }

  public onFormChange = ({ formData }: ISubmitEvent<object>) => {
    this.rawFormData = formData;
  }

  public render() {
    return (
      <div className="App">
        {Object.keys(this.state.schema).length > 0 && Object.keys(this.state.uiSchema).length > 0 && (
          <Form
            schema={this.state.schema}
            uiSchema={this.state.uiSchema}
            fields={formFields}
            formData={this.state.formData}
            onSubmit={this.onSubmit}
            onChange={this.onFormChange}
            liveValidate={true}
          >
            <ButtonGroup>
              <Button><Glyphicon glyph="upload" /> Upload</Button>
              <Button><Glyphicon glyph="download" /> Download</Button>
              <Button type="submit" bsStyle="primary"><Glyphicon glyph="ok" /> Save</Button>
              <Button type="reset"><Glyphicon glyph="remove" /> Reset</Button>
            </ButtonGroup>
          </Form>
        )
        }
        {Object.keys(this.state.formData).length > 0 &&
          <div>
            <h3>iOMEGA Paired data record:</h3>
            <textarea cols={120} rows={10} disabled={true} value={JSON.stringify(this.state.formData, null, 4)} />
          </div>
        }
      </div>
    );
  }
}

export default App;
