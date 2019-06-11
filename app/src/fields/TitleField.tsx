import React from "react";
import { FieldProps } from "react-jsonschema-form";

export function MyTitleField({ id, title }: FieldProps) {
  return (
    <legend id={id}>
      {title}
    </legend>
  );
}
