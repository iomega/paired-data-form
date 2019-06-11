import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { Logout, IProps } from "./Logout";


describe('<Logout>', () => {
    let wrapper: ShallowWrapper;
    let props: IProps;

    beforeEach(() => {
        props = {
            onLogout: jest.fn()
        }
        wrapper = shallow(<Logout {...props}/>);
    });

    it('should render with logout button', () => {
        expect(wrapper.html()).toContain('logout');
    });

    it('should call onLogout on click', () => {
        wrapper.find('Button').simulate('click');
        expect(props.onLogout).toHaveBeenCalled();
    });
});