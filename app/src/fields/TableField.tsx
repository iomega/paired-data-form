import * as React from "react";
import { FieldProps } from "react-jsonschema-form";
import { Button, Table, Glyphicon, OverlayTrigger, Popover } from "react-bootstrap";
import AddButton from 'react-jsonschema-form/lib/components/AddButton';
import IconButton from 'react-jsonschema-form/lib/components/IconButton';
import { toIdSchema, getDefaultFormState } from 'react-jsonschema-form/lib/utils';

import './TableField.css';

export const TableField = (props: FieldProps) => {
    const formData = props.formData ? props.formData : [];
    const rowSchema = (props.schema as any).items.properties;
    const required = new Set((props.schema as any).items.required);
    const headers = Object.entries(rowSchema).map(([key, s]: any) => 
        <th key={key} title={s.description} style={key === 'metabolomics_file'? {width:'50%'}: {}}>
            {s.title} 
            <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={
                <Popover id={"popover-" + key} style={{maxWidth: '600px'}} title={required.has(key) ? <label>{s.title}<span className="required">*</span></label> : <></>}>
                    {s.description}
                </Popover>
            }>
                <Button bsStyle="link" bsSize="xsmall">
                    <Glyphicon title={s.description} glyph="question-sign"/>
                </Button>
            </OverlayTrigger>
        </th>
    );
    headers.push(<th key='actions-th'></th>);
    const rows: JSX.Element[] = [];
    const SchemaField = props.registry.fields.SchemaField;
    if (props.formData) {
        const btnStyle = {
            flex: 1,
            paddingLeft: 6,
            paddingRight: 6,
            fontWeight: "bold",
        };
        props.formData.forEach((d: any, i: number) => {
            if (d === undefined) {
                d = {};
            }
            const tds = Object.entries(rowSchema).map(([k, v]: any) => {
                const itemIdPrefix = props.idSchema.$id + "_" + i;
                const idSchema = toIdSchema(
                    v,
                    itemIdPrefix,
                    props.definitions,
                    d,
                    props.idPrefix
                );
                const uiSchema = props.uiSchema.items[k]
                const errorSchema = {}
                const itemSchema = {...v};
                delete itemSchema.description;
                return (
                    <td key={i + k}>
                        <SchemaField
                            schema={itemSchema}
                            uiSchema={uiSchema}
                            errorSchema={errorSchema}
                            formData={d[k]}
                            registry={props.registry}
                            formContext={() => {}}
                            autofocus={props.autofocus}
                            readonly={props.readonly}
                            disabled={props.disabled}
                            name={k}
                            onChange={(value, errorSchema) => {
                                const item = {...formData[i]};
                                item[k] = value;
                                const newFormData = [...formData];
                                newFormData[i] = item;
                                props.onChange(newFormData, errorSchema && {
                                    ...props.errorSchema,
                                    [i] : errorSchema
                                });
                            }}
                            required={false}
                            idSchema={idSchema}
                        />
                    </td>
                );
            });
            tds.push(<td key={i + 'remove'}><IconButton
                type="danger"
                icon="remove"
                className="array-item-remove"
                tabIndex="-1"
                style={btnStyle}
                disabled={props.disabled || props.readonly}
                // onClick={props.onDropIndexClick(props.index)}
                onClick={() => {
                    const newFormData = [...formData];
                    newFormData.splice(i, 1)
                    props.onChange(newFormData);
                 }}
            /></td>);
            rows.push(<tr key={i}>{tds}</tr>);
        });
    }
    return (
        <>
            <span>{props.schema.description}</span>
            <Table condensed={true} striped={true} bordered={true} className="tableField">
                <thead>
                    <tr>
                        {headers}
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
            <AddButton
                className="array-item-add"
                onClick={() => {
                    props.onChange([...formData, 
                        getDefaultFormState(rowSchema, undefined, props.definitions)
                    ])
                }}
                disabled={props.disabled || props.readonly}
            />
        </>
    );
}