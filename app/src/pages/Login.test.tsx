import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { Login, IProps } from "./Login";


describe('<Login>', () => {
    let wrapper: ShallowWrapper;
    let props: IProps;

    beforeEach(() => {
        props = {
            onLogin: jest.fn(),
            error: ''
        }
        wrapper = shallow(<Login {...props}/>);
    });

    it('should render with password field', () => {
        expect(wrapper.html()).toContain('Password');
    });

    // TODO call onSubmit
});
