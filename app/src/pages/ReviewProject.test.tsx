import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { BrowserRouter } from 'react-router-dom';

jest.mock('../api', () => ({
    usePendingProject: () => {
        return {
            loading: false,
            error: null,
            data: {
                _id: 'project_id1',
                project: require('../../public/examples/paired_datarecord_MSV000078839_example.json')
            }
        };
    },
    useSchema: () => {
        return {
            loading: false,
            error: null,
            data: require('../../public/schema.json')
        }
    }
}));

import { ReviewProject } from "./ReviewProject";
import { createMemoryHistory } from "history";
import { PairedDataProject } from "../PairedDataProject";
import { Decide } from "../Decide";

describe('<ReviewProject>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        const history = createMemoryHistory();
        const match = {
            params: {
                id: 'project_id1'
            },
            isExact: true,
            path: '/projects/project_id1',
            url: 'http://localhost:3000/pending/projects/project_id1',
        }
        const context = {
            router: {}
        }
        wrapper = shallow(<ReviewProject history={history} match={match} location={history.location}/>, {context});
    });

    it('should render project', () => {
        expect(wrapper.find(PairedDataProject)).toHaveLength(1);
    })

    it('should render a deny and approve buttons', () => {
        expect(wrapper.find(Decide)).toHaveLength(2);
    });

});