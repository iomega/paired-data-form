import * as React from 'react';
import { shallow, ShallowWrapper } from 'enzyme';
import { Navbar } from 'react-bootstrap';

import { Routes } from './Routes';

describe('<Routes/>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<Routes/>);
    });

    it('should render Navbar', () => {
        expect(wrapper.find(Navbar)).toHaveLength(1);
    });
})