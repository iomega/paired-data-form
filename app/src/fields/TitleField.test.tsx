import * as React from "react";

import { render } from "enzyme";
import { FieldProps } from "@rjsf/core";

import { MyTitleField } from "./TitleField";

describe('MyTitleField', () => {
    let props: FieldProps;
    describe('When title does not start with number', () => {
        it('should render', () => {
            const comp = render(<MyTitleField {...props} id="myid" title="mytitle"/>);
            expect(comp.text()).toContain('mytitle');
        });
    });

    describe('When title does start with number', () => {
        it('should render', () => {
            const comp = render(<MyTitleField {...props} id="myid" title="1. mytitle"/>);
            expect(comp.text()).not.toContain('mytitle');
        });
    });
    
});
