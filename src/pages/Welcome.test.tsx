import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { Welcome } from "./Welcome";

describe('<Welcome>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<Welcome/>);
    });

    it('should render', () => {
        expect(wrapper.isEmptyRender()).toBeFalsy();
    })
});