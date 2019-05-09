import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { AddProject } from "./AddProject";

describe('<AddProject>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<AddProject/>);
    });

    it('should render', () => {
        expect(wrapper.isEmptyRender()).toBeFalsy();
    })
});