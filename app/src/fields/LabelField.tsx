import React from "react";
import { FieldProps } from "react-jsonschema-form";

const REQUIRED_FIELD_SYMBOL = " (required)";

export function MyLabelField(props: FieldProps) {
    const { label, required, id } = props;
    if (!label) {
      return null;
    }
    return (
      <label className="control-label" htmlFor={id}>
        {label}
        {required && <span className="required">{REQUIRED_FIELD_SYMBOL}</span>}
      </label>
    );
  }
  