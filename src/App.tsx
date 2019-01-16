import * as React from "react";

import { JSONSchema6 } from "json-schema";
import { Button, ButtonGroup, Glyphicon } from 'react-bootstrap';
import Form, { ISubmitEvent } from "react-jsonschema-form";
import CollapsibleField from "react-jsonschema-form-extras/lib/CollapsibleField";
import TableField from "react-jsonschema-form-extras/lib/table";


import "./App.css";

interface IState {
  schema: JSONSchema6;
  uiSchema: any;
  formData: object;
}

const formFields = {
  collapsible: CollapsibleField,
  table: TableField
};

class App extends React.Component<{}, IState> {
  public state: IState = { schema: {}, uiSchema: {}, formData: {} };
  public labels = {
    genome: [],
    sample: [],
    extraction: [],
    instrumentation: []
  }

  public componentDidMount() {
    fetch("schema.json")
      .then(r => r.json())
      .then(schema => this.setState({ schema }));
    fetch("uischema.json")
      .then(r => r.json())
      .then(uiSchema => {
        this.setState({ uiSchema });
      });
  }

  public onSubmit = ({ formData }: ISubmitEvent<object>) => {
    this.setState({ formData });
  }

  public onChange = (data: any) => {
    const newLabels = this.fetchForeignKeys(data.formData);
    if (this.labelsChanged(newLabels)) {
      this.labels = newLabels;
      this.updateForeignKeys();
    }
  }

  public labelsChanged(newLabels: any): any {
    return JSON.stringify(this.labels) !== JSON.stringify(newLabels);
  }

  public fetchForeignKeys(formData: any) {
    if (Object.keys(formData.data_to_link).length === 0) {
      return;
    }

    const labels: any = {};
    if (formData.data_to_link['metagenome_genome sequence_assemblies']) {
      labels.genome = formData.data_to_link['metagenome_genome sequence_assemblies'].map((r: any) => r.GenBank_accession || r.RefSeq_accession || r.ENA_NCBI_accession || r.MGnify_accession);
    }

    if (formData.data_to_link.Experimental_details) {
      if (formData.data_to_link.Experimental_details.Sample_Preparation) {
        labels.sample = formData.data_to_link.Experimental_details.Sample_Preparation.map((r: any) => r.Sample_preparation_Method);
      }
      if (formData.data_to_link.Experimental_details['Extraction Methods']) {
        labels.extraction = formData.data_to_link.Experimental_details['Extraction Methods'].map((r: any) => r.Extraction_Method);
      }

      if (formData.data_to_link.Experimental_details['Instrumentation Methods']) {
        labels.instrumentation = formData.data_to_link.Experimental_details['Instrumentation Methods'].map((r: any) => r.Instrumentation_Method);
      }
    }
    return labels;
  }

  public updateForeignKeys = () => {
    const uiSchema = this.state.uiSchema;
    if (Object.keys(uiSchema).length === 0) {
      return;
    }

    uiSchema.Genome_Metabolome_links.table.tableCols[1].editable.options.values = this.labels.genome;
    uiSchema.Genome_Metabolome_links.table.tableCols[2].editable.options.values = this.labels.sample;
    uiSchema.Genome_Metabolome_links.table.tableCols[3].editable.options.values = this.labels.extraction;
    uiSchema.Genome_Metabolome_links.table.tableCols[4].editable.options.values = this.labels.instrumentation;
    this.setState({ uiSchema });
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
            liveValidate={true}
            onChange={this.onChange}
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
