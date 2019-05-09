import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { PendingProjects } from "./PendingProjects";


describe('<PendingProjects>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<PendingProjects/>);
    });

    it('should render single row', () => {
        expect(wrapper.find('tbody').find('tr').length).toEqual(1);
    })
});