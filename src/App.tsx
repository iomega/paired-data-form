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
        uiSchema.links.items.genome_ID.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.links.items.sample_preparation_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.links.items.extraction_method_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.links.items.instrumentation_method_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.BGC_MS2_links.items.MS2_URL.foreignKey.search = this.searchLabels.bind(
          this
        );
        this.setState({ uiSchema });
      });
  }

  public searchLabels = (url: string) => {
    if (url === "genome_ID") {
      if (!this.rawFormData.genomes) {
        return [];
      }

      const labels = this.rawFormData.genomes.map(
        (r: any) =>
          r.GenBank_accession ||
          r.RefSeq_accession ||
          r.ENA_NCBI_accession ||
          r.MGnify_accession ||
          r.BioSample_accession
      );
      return labels;
    } else if (url === "sample_preparation_label") {
      if (
        !this.rawFormData.experimental.sample_preparation
      ) {
        return [];
      }

      const labels = this.rawFormData.experimental.sample_preparation.map(
        (r: any) => r.sample_preparation_method
      );
      return labels;
    } else if (url === "extraction_method_label") {
      if (
        !this.rawFormData.experimental.extraction_methods
      ) {
        return [];
      }

      const labels = this.rawFormData.experimental.extraction_methods.map((r: any) => r.extraction_method);
      return labels;
    } else if (url === "instrumentation_method_label") {
      if (
        this.rawFormData.experimental.instrumentation_methods === undefined
      ) {
        return [];
      }

      const labels = this.rawFormData.experimental.instrumentation_methods.map((r: any) => r.instrumentation_method);
      return labels;
    } else if (url === 'MS2_URL') {
      if (!this.rawFormData.links) {
        return [];
      }
      const labels = this.rawFormData.links.map((r: any) => r.metabolomics_file);
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
    if (!formData.links) {
      return errors;
    }
    const gmIds = this.searchLabels("genome_ID");
    const spIds = this.searchLabels("sample_preparation_label");
    const emIds = this.searchLabels("extraction_method_label");
    const imIds = this.searchLabels("instrumentation_method_label");
    formData.links.forEach(
      (genomeMetabolomeLink: any, i: number) => {
        if (
          genomeMetabolomeLink.genome_ID &&
          !gmIds.includes(genomeMetabolomeLink.genome_ID)
        ) {
          errors.links[i].genome_ID.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.sample_preparation_label &&
          !spIds.includes(genomeMetabolomeLink.sample_preparation_label)
        ) {
          errors.links[i].sample_preparation_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.extraction_method_label &&
          !emIds.includes(genomeMetabolomeLink.extraction_method_label)
        ) {
          errors.links[i].extraction_method_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.instrumentation_method_label &&
          !imIds.includes(genomeMetabolomeLink.instrumentation_method_label)
        ) {
          errors.links[
            i
          ].instrumentation_method_label.addError("Invalid selection");
        }
      }
    );
    if (formData.BGC_MS2_links) {
      const msUrls = this.searchLabels("MS2_URL");
      formData.BGC_MS2_links.forEach((geneSpectraLink: any, i: number) => {
        if (geneSpectraLink.MS2_URL && !msUrls.includes(geneSpectraLink.MS2_URL)) {
          errors.BGC_MS2_links[i].MS2_URL.addError("Invalid selection");
        }
      });
    }
    return errors;
  };
}

export default App;
