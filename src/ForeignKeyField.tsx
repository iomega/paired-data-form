import * as React from "react";

import { FieldProps } from 'react-jsonschema-form';
import AsyncSelect from 'react-select/lib/Async';

export class ForeignKeyField extends React.Component<FieldProps, {}> {
    public handleChange = (option: any) => {
        this.props.onChange(option.value);
    }

    public loadOptions = () => {
        const values = this.props.uiSchema.foreignKey.search(this.props.name);
        return values.then((vals: string[]) => {
            return vals.map((v: string) => {
                return { value: v, label: v };
            });
        });
    }

    public render() {
        return (
            <div>
                <label>{this.props.schema.title}</label>
                <p>{this.props.schema.description}</p>
                <AsyncSelect
                    defaultValue={this.props.formData}
                    cacheOptions={false}
                    defaultOptions={true}
                    loadOptions={this.loadOptions}
                    onChange={this.handleChange}
                />
            </div>
        );
    }
}
