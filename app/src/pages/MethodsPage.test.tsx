import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { MethodsPage } from "./MethodsPage";

describe('<MethodsPage>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<MethodsPage/>);
    });

    it('should render', () => {
        expect(wrapper.isEmptyRender()).toBeFalsy();
    })
});
