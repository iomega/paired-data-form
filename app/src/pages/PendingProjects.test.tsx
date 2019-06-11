import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";

jest.mock('../api', () => ({
    usePendingProjects: () => {
        return {
            loading: false,
            error: null,
            data: {
                data: [{
                    _id:'someid',
                    project: require('../../public/examples/paired_datarecord_MSV000078839_example.json')
                }]
            },
            setData: jest.fn()
        };
    }
}));

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