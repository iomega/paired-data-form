import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { EditProject } from "./EditProject";

describe('<EditProject>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<EditProject/>);
    });

    it('should render', () => {
        expect(wrapper.isEmptyRender()).toBeFalsy();
    })
});