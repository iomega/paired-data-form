import * as React from "react";
import { FieldProps } from "react-jsonschema-form";

export const TableRowFieldTemplate = ({ properties }: FieldProps) => {
    return properties.map((prop: any) => {
        return (
            <td className="table-cell-field" key={prop.content.key}>
                {prop.content}
            </td>
        );
    });
}
