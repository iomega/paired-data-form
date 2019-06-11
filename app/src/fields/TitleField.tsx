import React from "react";
import { FieldProps } from "react-jsonschema-form";

const REQUIRED_FIELD_SYMBOL = " (required)";

export function MyTitleField({ id, title, required }: FieldProps) {
  return (
    <legend id={id}>
      {title}
      {required && <span className="required">{REQUIRED_FIELD_SYMBOL}</span>}
    </legend>
  );
}
