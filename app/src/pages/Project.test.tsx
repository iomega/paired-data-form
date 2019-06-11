import * as React from "react";

import { mount, ReactWrapper } from "enzyme";
import { createMemoryHistory } from "history";
import { MemoryRouter } from "react-router";

// Mock useFetch so it returns data immediately
jest.mock('../api', () => ({
    useProject: () => {
        return {
            loading: false,
            error: null,
            data: {
                _id: 'project_id1',
                project: require('../../public/examples/paired_datarecord_MSV000078839_example.json'),
                enrichments: null
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

import { Project } from "./Project";
import { PairedDataProject } from "../PairedDataProject";

describe('<Project>', () => {
    let wrapper: ReactWrapper;

    beforeEach(() => {
        const history = createMemoryHistory();
        const match = {
            params: {
                id: 'project_id1'
            },
            isExact: true,
            path: '/projects/project_id1',
            url: 'http://localhost:3000/projects/project_id1',
        }
        wrapper = mount(<MemoryRouter><Project history={history} match={match} location={history.location}/></MemoryRouter>);
    });

    it('should render project', () => {
        expect(wrapper.find(PairedDataProject)).toHaveLength(1);
    })

    it('should render a edit button', () => {
        expect(wrapper.html()).toContain('Edit');
    });

    it('should render a clone button', () => {
        expect(wrapper.html()).toContain('Clone');
    });
});