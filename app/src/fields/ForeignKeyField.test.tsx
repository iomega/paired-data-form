import * as React from "react";

import { shallow } from "enzyme";
import { FieldProps } from "@rjsf/core";
import Select from "react-select";

import { ForeignKeyField } from "./ForeignKeyField";

describe('ForeignKeyField', () => {
    let props: FieldProps;

    describe('when closed', () => {
        let comp: any;
        let onChange: any;
        beforeEach(() => {
            const schema = {
                title: "MyTitle",
                description: "MyDescription"
            };
            const uiSchema = {
                foreignKey: {
                    search: () => ['opt1', 'opt2']
                }
            };
            onChange = jest.fn();
            comp = shallow(<ForeignKeyField {...props} uiSchema={uiSchema} schema={schema} required={true} onChange={onChange}/>);
        });

        it('should render a "Click to select"', () => {
            expect(comp.text()).toContain('Click to select');
        });

        describe('when clicked', () => {
            beforeEach(() => {
                comp.find('.form-control').simulate('click');
            });
            
            it('should render select field', () => {
                expect(comp.find(Select)).toBeTruthy();
            });

            describe('when opt1 is selected', () => {
                beforeEach(() => {
                    comp.find(Select).simulate('change', {value:'opt1'})
                });

                it('should call onChange', () => {
                    expect(onChange).toHaveBeenCalledWith('opt1');
                });
            })
        })
    })
});