import * as React from "react";

import { shallow } from "enzyme";
import { JSONSchema6 } from "json-schema";
import { IdSchema } from "react-jsonschema-form";
import AddButton from 'react-jsonschema-form/lib/components/AddButton';

import { TableFieldTemplate } from "./TableFieldTemplate";

const makeProps = (schema: any, uiSchema: any, items: any) => {
    const idSchema = {
        $id: 'mytable1'
    } as IdSchema;
    const formContext = {};
    return {
        schema,
        uiSchema,
        items,
        disabled: false,
        readonly: false,
        onAddClick: jest.fn(),
        idSchema,
        formData: {},
        registry: {
            fields: {},
            widgets: {},
            definitions: {},
            formContext
        },
        required: false,
        name: 'mytable',
        errorSchema: {},
        onChange: jest.fn(),
        formContext,
        autofocus: false,
    }
}

describe('TableFieldTemplate', () => {
    let schema: JSONSchema6;
    let uiSchema: any;
    let items: any[];

    beforeEach(() => {
        schema = {
            type: "array",
            title: "Mytable",
            description: "My table description",
            items: {
                type: "object",
                properties: {
                    col1: {
                        type: "string",
                        title: "First column title",
                        description: "First column description"
                    }
                },
                required: []
            }
        };
        uiSchema = {};
        items = [];
    });

    describe('with zero rows and no ui options', () => {
        let comp: any;

        beforeEach(() => {
            const props = makeProps(schema, uiSchema, items);
            comp = shallow(<TableFieldTemplate {...props} />);
        });

        it('should render two table header tags, one data column and one action column', () => {
            expect(comp.find('th').length).toBe(2);
        });

        it('should render an Add button', () => {
            expect(comp.find(AddButton).length).toBe(1);
        });
    });
});