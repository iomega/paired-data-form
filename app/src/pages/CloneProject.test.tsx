import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";

jest.mock('../api', () => ({
    useEnrichedProject: () => {
        return {
            loading: false,
            error: null,
            data: require('../../public/examples/paired_datarecord_MSV000078839_example.json')
        };
    },
    useSubmitProject: () => {
        return [false, jest.fn()];
    }
}));

import { CloneProject } from "./CloneProject";
import { createMemoryHistory } from "history";
import { ProjectForm } from "../ProjectForm";

describe('<CloneProject>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        const history = createMemoryHistory();
        const match = {
            params: {
                id: 'project_id1'
            },
            isExact: true,
            path: '/projects/project_id1',
            url: 'http://localhost:3000/projects/project_id1/clone',
        }
        wrapper = shallow(<CloneProject history={history} match={match} location={history.location}/>);
    });

    it('should render ProjectForm', () => {
        expect(wrapper.find(ProjectForm)).toHaveLength(1);
    });
});