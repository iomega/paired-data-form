import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";
import { EditProject } from "./EditProject";
import { createMemoryHistory } from "history";

describe('<EditProject>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        const history = createMemoryHistory();
        const match = {
            params: {
                id: 'project_id1'
            },
            isExact: true,
            path: '/projects/project_id1/edit',
            url: 'http://localhost:3000/projects/project_id1/edit',
        }
        wrapper = shallow(<EditProject history={history} match={match} location={history.location}/>);
    });

    it('should render', () => {
        expect(wrapper.isEmptyRender()).toBeFalsy();
    })
});