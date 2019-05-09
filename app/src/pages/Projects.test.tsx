import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { Projects } from "./Projects";


describe('<Projects>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<Projects/>);
    });

    it('should render single row', () => {
        expect(wrapper.find('tbody').find('tr').length).toEqual(1);
    })
});