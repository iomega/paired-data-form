import * as React from "react";

import { Glyphicon } from "react-bootstrap";
import { FieldProps } from "react-jsonschema-form";
import Select from "react-select";
import { OptionsType } from "react-select/lib/types";

interface LabelValue {
  label: string;
  value: string;
}

interface IState {
  open: boolean;
  options: OptionsType<LabelValue>;
  error: string;
}

export class ForeignKeyField extends React.Component<FieldProps, {}> {
  public state: IState = {
    open: false,
    options: [],
    error: '',
  };

  public handleChange = (option: any) => {
    this.props.onChange(option.value);
  };

  public loadOptions = () => {
    const values = this.props.uiSchema.foreignKey.search(this.props.name);
    return values.map((v: string) => {
      return { value: v, label: v };
    });
  };

  public render() {
    let field = (
      <span className="form-control" onClick={this.onOpen}>
        {this.props.formData || "Click to select"}
        <span className="pull-right">
          <Glyphicon glyph="chevron-down" />
        </span>
      </span>
    );
    if (this.state.open && this.state.options.length > 0) {
      const value = { value: this.props.formData, label: this.props.formData };
      field = (
        <Select
          value={value}
          onChange={this.onClose}
          options={this.state.options}
          menuIsOpen={true}
        />
      );
    }
    return (
      <>
        <label className="control-label">
          {this.props.schema.title}
          {this.props.required && <span className="required">*</span>}
        </label>
        <p className="field-description">{this.props.schema.description}</p>
        {field}
        {this.state.error && <p className="text-danger">{this.state.error}</p>}
      </>
    );
  }

  public onOpen = () => {
    try {
      const options = this.loadOptions();
      if (options.length > 0) {
        this.setState({ open: true, options, error: '' });
      } else {
        this.setState({ error: 'No choices found, fill sections above before creating a link' });
      }
    } catch (error) {
      this.setState({ error: error.message });
    }
  };

  public onClose = (event: any) => {
    const value = event.value;
    this.setState(
      {
        value,
        open: false,
        options: [],
        error: '',
      },
      () => {
        this.props.onChange(value);
      }
    );
  };
}
