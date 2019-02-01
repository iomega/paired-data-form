import * as React from "react";

import { JSONSchema6 } from "json-schema";
import { Button, ButtonGroup, Glyphicon } from "react-bootstrap";
import Form, { FormValidation, ISubmitEvent } from "react-jsonschema-form";
import CollapsibleField from "react-jsonschema-form-extras/lib/CollapsibleField";
import { ForeignKeyField } from "./ForeignKeyField";

import "./App.css";
import { PairedDataRecord } from "./PairedDataRecord";

interface IState {
  schema: JSONSchema6;
  uiSchema: any;
  formData: object;
}

const formFields = {
  collapsible: CollapsibleField,
  foreignKey: ForeignKeyField
};

class App extends React.Component<{}, IState> {
  public state: IState = { schema: {}, uiSchema: {}, formData: {} };
  public rawFormData: any = {};
  private uploadRef: React.RefObject<HTMLInputElement>;

  constructor(props: {}) {
    super(props);
    this.uploadRef = React.createRef();
  }

  public componentDidMount() {
    fetch("schema.json")
      .then(r => r.json())
      .then(schema => this.setState({ schema }));
    fetch("uischema.json")
      .then(r => r.json())
      .then(uiSchema => {
        // inject foreign key search method
        uiSchema.Genome_Metabolome_links.items.Genome_Metagenome_ID.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.Genome_Metabolome_links.items.Sample_preparation_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.Genome_Metabolome_links.items.Extraction_method_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.Genome_Metabolome_links.items.Instrumentation_method_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        this.setState({ uiSchema });
      });
  }

  public searchLabels = (url: string) => {
    if (Object.keys(this.rawFormData.data_to_link).length === 0) {
      throw new Error("Missing data to link");
    }
    if (url === "Genome_Metagenome_ID") {
      if (
        this.rawFormData.data_to_link[
          "metagenome_genome sequence_assemblies"
        ] === undefined
      ) {
        return [];
      }

      const labels = this.rawFormData.data_to_link[
        "metagenome_genome sequence_assemblies"
      ].map(
        (r: any) =>
          r.GenBank_accession ||
          r.RefSeq_accession ||
          r.ENA_NCBI_accession ||
          r.MGnify_accession
      );
      return labels;
    } else if (url === "Sample_preparation_label") {
      if (
        this.rawFormData.data_to_link.Experimental_details
          .Sample_Preparation === undefined
      ) {
        return [];
      }

      const labels = this.rawFormData.data_to_link.Experimental_details.Sample_Preparation.map(
        (r: any) => r.Sample_preparation_Method
      );
      return labels;
    } else if (url === "Extraction_method_label") {
      if (
        this.rawFormData.data_to_link.Experimental_details[
          "Extraction Methods"
        ] === undefined
      ) {
        return [];
      }

      const labels = this.rawFormData.data_to_link.Experimental_details[
        "Extraction Methods"
      ].map((r: any) => r.Extraction_Method);
      return labels;
    } else if (url === "Instrumentation_method_label") {
      if (
        this.rawFormData.data_to_link.Experimental_details[
          "Instrumentation Methods"
        ] === undefined
      ) {
        return [];
      }

      const labels = this.rawFormData.data_to_link.Experimental_details[
        "Instrumentation Methods"
      ].map((r: any) => r.Instrumentation_Method);
      return labels;
    }
    throw new Error("Unknown link");
  };

  public onSubmit = ({ formData }: ISubmitEvent<object>) => {
    this.setState({ formData });
  };

  public onFormChange = ({ formData }: ISubmitEvent<object>) => {
    this.rawFormData = formData;
  };

  public render() {
    return (
      <div className="App">
        {Object.keys(this.state.schema).length > 0 &&
          Object.keys(this.state.uiSchema).length > 0 && (
            <Form
              schema={this.state.schema}
              uiSchema={this.state.uiSchema}
              fields={formFields}
              formData={this.state.formData}
              onSubmit={this.onSubmit}
              onChange={this.onFormChange}
              validate={this.validate}
            >
              <ButtonGroup>
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
                <Button type="submit" bsStyle="primary">
                  <Glyphicon glyph="ok" /> Save
                </Button>
                <Button type="reset">
                  <Glyphicon glyph="remove" /> Reset
                </Button>
              </ButtonGroup>
            </Form>
          )}
        {Object.keys(this.state.formData).length > 0 && (
          <PairedDataRecord
            data={this.state.formData}
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
        this.setState({ formData });
      }
    };
    reader.readAsText(file);
  };

  public validate = (formData: any, errors: FormValidation) => {
    if (!formData.Genome_Metabolome_links) {
      return errors;
    }
    const gmIds = this.searchLabels("Genome_Metagenome_ID");
    const spIds = this.searchLabels("Sample_preparation_label");
    const emIds = this.searchLabels("Extraction_method_label");
    const imIds = this.searchLabels("Instrumentation_method_label");
    formData.Genome_Metabolome_links.forEach(
      (genomeMetabolomeLink: any, i: number) => {
        if (
          genomeMetabolomeLink.Genome_Metagenome_ID &&
          !gmIds.includes(genomeMetabolomeLink.Genome_Metagenome_ID)
        ) {
          errors.Genome_Metabolome_links[i].Genome_Metagenome_ID.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.Sample_preparation_label &&
          !spIds.includes(genomeMetabolomeLink.Sample_preparation_label)
        ) {
          errors.Genome_Metabolome_links[i].Sample_preparation_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.Extraction_method_label &&
          !emIds.includes(genomeMetabolomeLink.Extraction_method_label)
        ) {
          errors.Genome_Metabolome_links[i].Extraction_method_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.Instrumentation_method_label &&
          !imIds.includes(genomeMetabolomeLink.Instrumentation_method_label)
        ) {
          errors.Genome_Metabolome_links[
            i
          ].Instrumentation_method_label.addError("Invalid selection");
        }
      }
    );
    return errors;
  };
}

export default App;
