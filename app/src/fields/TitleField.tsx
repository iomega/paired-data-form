import React from "react";
import { FieldProps } from "@rjsf/core";

export function MyTitleField({id, title}: FieldProps) {
  const title_starts_with_number = title && !isNaN(Number.parseInt(title.charAt(0))) && title.charAt(1) === '.';
  if (title_starts_with_number) {
     // All collapsible fields already have the title of the object in them don't repeat it as a legend.
     // As all collapsible fields start with `\d.`, use it to choose between normal objects and collapsible objects.
     return <></>;
  }
  return (
    <legend id={id}>
      {title}
    </legend>
  );
}
