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

interface IState {
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

class App extends React.Component<{}, IState> {
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
      .then(schema => this.setState({ schema }));
    fetch("uischema.json")
      .then(r => r.json())
      .then(uiSchema => {
        // inject foreign key search method
        uiSchema.genome_metabolome_links.items.genome_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.genome_metabolome_links.items.sample_preparation_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.genome_metabolome_links.items.extraction_method_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.genome_metabolome_links.items.instrumentation_method_label.foreignKey.search = this.searchLabels.bind(
          this
        );
        uiSchema.BGC_MS2_links.items.MS2_URL.foreignKey.search = this.searchLabels.bind(
          this
        );
        this.setState({ uiSchema });
      });
  }

  public searchLabels = (url: string) => {
    const form = this.formRef.current;
    if (!form) {
      return [];
    }
    const currentDoc = (form.state as any).formData;
    if (!currentDoc) {
      return [];
    }
    if (url === "genome_label") {
      if (!currentDoc.genomes) {
        return [];
      }

      const labels = currentDoc.genomes.map(
        (r: any) =>
          r.genome_label
      );
      return labels;
    } else if (url === "sample_preparation_label") {
      if (
        !currentDoc.experimental.sample_preparation
      ) {
        return [];
      }

      const labels = currentDoc.experimental.sample_preparation.map(
        (r: any) => r.sample_preparation_method
      );
      return labels;
    } else if (url === "extraction_method_label") {
      if (
        !currentDoc.experimental.extraction_methods
      ) {
        return [];
      }

      const labels = currentDoc.experimental.extraction_methods.map((r: any) => r.extraction_method);
      return labels;
    } else if (url === "instrumentation_method_label") {
      if (
        currentDoc.experimental.instrumentation_methods === undefined
      ) {
        return [];
      }

      const labels = currentDoc.experimental.instrumentation_methods.map((r: any) => r.instrumentation_method);
      return labels;
    } else if (url === 'MS2_URL') {
      if (!currentDoc.genome_metabolome_links) {
        return [];
      }
      const labels = currentDoc.genome_metabolome_links.map((r: any) => r.metabolomics_file);
      return labels;
    }
    throw new Error("Unknown link");
  };

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
              validate={this.validate}
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

  public validate = (formData: any, errors: any) => {
    if (formData.experimental.extraction_methods) {
      formData.experimental.extraction_methods.forEach((e: any, i: number) => {
        const ratioTotal = e.solvents.reduce((c: number, s: any) => {
          return s.ratio + c;
        }, 0);
        if (ratioTotal > 1) {
          errors.experimental.extraction_methods[i].solvents.addError(
            'Combined ratio not within 0 and 1'
          );
        }
      });
    }
    if (!formData.genome_metabolome_links) {
      return errors;
    }
    const gmIds = this.searchLabels("genome_label");
    const spIds = this.searchLabels("sample_preparation_label");
    const emIds = this.searchLabels("extraction_method_label");
    const imIds = this.searchLabels("instrumentation_method_label");
    formData.genome_metabolome_links.forEach(
      (genomeMetabolomeLink: any, i: number) => {
        if (
          genomeMetabolomeLink.genome_label &&
          !gmIds.includes(genomeMetabolomeLink.genome_label)
        ) {
          errors.genome_metabolome_links[i].genome_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.sample_preparation_label &&
          !spIds.includes(genomeMetabolomeLink.sample_preparation_label)
        ) {
          errors.genome_metabolome_links[i].sample_preparation_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.extraction_method_label &&
          !emIds.includes(genomeMetabolomeLink.extraction_method_label)
        ) {
          errors.genome_metabolome_links[i].extraction_method_label.addError(
            "Invalid selection"
          );
        }
        if (
          genomeMetabolomeLink.instrumentation_method_label &&
          !imIds.includes(genomeMetabolomeLink.instrumentation_method_label)
        ) {
          errors.genome_metabolome_links[
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

  public loadExample1 = () => {
    fetch('examples/paired_datarecord_MSV000078839_example.json')
      .then(r => r.json())
      .then(this.fillForm);
  }

  private fillForm = (doc: any) => {
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

export default App;
