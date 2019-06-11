import * as React from "react";

import { Glyphicon } from "react-bootstrap";
import { FieldProps } from "react-jsonschema-form";
import Select from "react-select";

export class ForeignKeyField extends React.Component<FieldProps, {}> {
  public state = {
    open: false,
    options: []
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
      field = (
        <Select
          defaultValue={this.props.formData}
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
        <p>{this.props.schema.description}</p>
        {field}
      </>
    );
  }

  public onOpen = () => {
    const options = this.loadOptions();
    this.setState({ open: true, options });
  };

  public onClose = (event: any) => {
    const value = event.value;
    this.setState(
      {
        value,
        open: false,
        options: []
      },
      () => {
        this.props.onChange(value);
      }
    );
  };
}
