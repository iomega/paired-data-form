import * as React from "react";

import { FieldProps, UiSchema } from '@rjsf/core';
import { useState } from "react";

interface CollapseProps {
    collapsed: boolean;
    field: string
}

interface CollapseUiSchema extends UiSchema {
    collapse?: CollapseProps
}

interface Props extends FieldProps {
    uiSchema: CollapseUiSchema
}

export const CollapsibleField = (props: Props) => {
    const [collapsed, setCollapsed] = useState(props.uiSchema.collapse!.collapsed ? true : false);
    const CollapseElement = props.registry.fields[props.uiSchema.collapse!.field];
    return (
        <div id={'collapsible_' + props.idSchema.$id}>
            <div className="lead">
                <div 
                    className="collapsibleHeading"
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        cursor: 'pointer',
                        background: 'linear-gradient(to right, #0472B6, white)',
                        padding: '14px',
                        margin: '',
                        marginTop: '-5px',
                        marginBottom: '5px'
                    }}
                >
                    <span style={{color: 'white'}}>{props.schema.title || props.name}</span>
                    &nbsp;
                    <span style={{color: 'white'}} className={collapsed ? 'glyphicon glyphicon-chevron-right' : 'glyphicon glyphicon-chevron-down'} aria-hidden="true"/>
                </div>
            </div>
            {!collapsed && <CollapseElement {...props}/>}
        </div>
    );
}