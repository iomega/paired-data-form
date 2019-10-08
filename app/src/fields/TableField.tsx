import * as React from "react";

import { FieldProps } from 'react-jsonschema-form';
import ArrayField from 'react-jsonschema-form/lib/components/fields/ArrayField';

import { TableFieldTemplate } from "./TableFieldTemplate";
import { TableRowFieldTemplate } from "./TableRowFieldTemplate";
import { TableCellFieldTemplate } from "./TableCellFieldTemplate";

export const TableField = (props: FieldProps) => {
    props.uiSchema['ui:ArrayFieldTemplate'] = TableFieldTemplate;
    if (!props.uiSchema.items) {
        props.uiSchema.items = {};
    }
    props.uiSchema.items['ui:ObjectFieldTemplate'] = TableRowFieldTemplate;
    props.uiSchema.items['ui:FieldTemplate'] = TableCellFieldTemplate;
    return <ArrayField {...props}/>
}
