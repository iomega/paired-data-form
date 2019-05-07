import * as React from "react";

import { shallow } from "enzyme";

import { Decide, IProps } from "./Decide";

describe('Decide', () => {
    let props: IProps;
    let comp: any;

    beforeEach(() => {
        props = {
            onApprove: jest.fn(),
            onDeny: jest.fn()
        }
        comp = shallow(<Decide onApprove={props.onApprove} onDeny={props.onDeny}/>);
    });

    it('should have an approve button', () => {
        expect(comp.html()).toContain('Approve');
    });

    it('should have an deny button', () => {
        expect(comp.html()).toContain('Deny');
    });

    it('should call onApprove when approve button is clicked', () => {
        comp.find('[bsStyle="success"]').simulate('click');
        expect(props.onApprove).toHaveBeenCalled();
    });

    it('should call onDeny when deny button is clicked', () => {
        comp.find('[bsStyle="danger"]').simulate('click');
        expect(props.onDeny).toHaveBeenCalled();
    });
})