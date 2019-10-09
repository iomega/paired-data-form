import * as React from "react";

import { Button, Table, Glyphicon, OverlayTrigger, Popover } from "react-bootstrap";
import { FieldProps } from "react-jsonschema-form";
import AddButton from 'react-jsonschema-form/lib/components/AddButton';
import IconButton from 'react-jsonschema-form/lib/components/IconButton';

import './TableFieldTemplate.css';
import { isObject } from "util";

const btnStyle = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: "bold",
};

export const TableFieldTemplate = (props: FieldProps) => {
    const required = new Set((props.schema as any).items.required);
    const rowSchema = (props.schema as any).items.properties;
    let widths: { [name: string]: string } = {};
    if (props.uiSchema['ui:options'] && props.uiSchema['ui:options'].widths && isObject(props.uiSchema['ui:options'].widths)) {
        widths = props.uiSchema['ui:options'].widths as { [name: string]: string };
    }
    const headers = Object.entries(rowSchema).map(([key, s]: any, i: number) => {
        const title = required.has(key) ? <label>{s.title}<span className="required">*</span></label> : <label>{s.title}</label>;
        let description = s.description;
        if (s.type === 'object') {
            const propDescs = Object.entries(s.properties).filter((d: any) => d[1].description).map(([skey, sschema]: any) => (
                <li key={skey}>
                    <label className="control-label">{sschema.title}</label>
                    <p className="field-description">{sschema.description}</p>
                </li>
            ));
            const depDescs: any[] = [];
            if (s.dependencies) { 
                Object.values(s.dependencies).forEach((oneOf: any) => {
                    oneOf.oneOf.forEach((o: any) => {
                        Object.entries(o.properties).filter((d: any) => d[1].description).forEach(([okey, oschema]: any) => {
                            depDescs.push(
                                <li key={okey}>
                                    <label className="control-label">{oschema.title}</label>
                                    <p className="field-description">{oschema.description}</p>
                                </li>
                            )
                        });
                    });
                });
            }
            description = (
                <>
                    <span>{s.description}</span>
                    <ul>
                        { propDescs }
                        { depDescs }
                    </ul>
                </>
            );
        }
        return (
            <th key={key} title={s.description} style={widths[i.toString()] ? { width: widths[i.toString()] } : {}}>
                {s.title}
                <OverlayTrigger trigger="click" placement="bottom" rootClose overlay={
                    <Popover id={"popover-" + key} style={{ maxWidth: '600px' }} title={title}>
                        {description}
                    </Popover>
                }>
                    <Button bsStyle="link" bsSize="xsmall">
                        <Glyphicon title={s.description} glyph="question-sign" />
                    </Button>
                </OverlayTrigger>
            </th>
        );
    });
    headers.push(<th key='actions-th'></th>);
    let rows: JSX.Element[] = [];
    if (props.items) {
        rows = props.items.map((element: any) => {
            return (
                <tr key={element.key} className={element.className}>
                    {element.children}
                    <td>
                        <IconButton
                            type="danger"
                            icon="remove"
                            className="array-item-remove"
                            tabIndex="-1"
                            style={btnStyle}
                            disabled={props.disabled || props.readonly}
                            onClick={element.onDropIndexClick(element.index)}
                        />
                    </td>
                </tr>
            );
        });
    }
    return (
        <fieldset>
            <legend>{props.schema.title}</legend>
            <p className="field-description">{props.schema.description}</p>
            <Table condensed={true} striped={true} bordered={true} className="table-field">
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
                onClick={props.onAddClick}
                disabled={props.disabled || props.readonly}
            />
        </fieldset>
    );
}
