import * as React from "react";

import { render } from "enzyme";
import { FieldProps } from "react-jsonschema-form";

import { GenomeMetabolomeLinksField } from "./GenomeMetabolomeLinksField";

describe('GenomeMetabolomeLinksField', () => {
    let props: FieldProps;
    it('should render upload button', () => {
        const formContext = {};
        const uiSchema = {};
        const onChange = jest.fn();
        const registry = {
            fields: {},
            widgets: {},
            definitions: {},
            formContext
        };
        const schema = {};

        const comp = render(<GenomeMetabolomeLinksField 
            {...props} 
            uiSchema={uiSchema} 
            onChange={onChange} 
            schema={schema}
            registry={registry}
        />);
        expect(comp.text()).toContain('Upload links');
    });
});
