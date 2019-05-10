import * as React from "react";

import { shallow, ShallowWrapper } from "enzyme";

// Mock useFetch so it returns data immediately
jest.mock('../api', () => ({
    useProjects: () => {
        return [{
            _id: 'id1',
            GNPSMassIVE_ID: 'somegnpsid',
            PI_name: 'somepi',
            nr_genomes: 3,
            nr_growth_conditions: 4,
            nr_extraction_methods: 5,
            nr_instrumentation_methods: 2,
            nr_genome_metabolmics_links: 123,
            nr_genecluster_mspectra_links: 42,
        }];
    }
}));

import { Projects } from "./Projects";

describe('<Projects>', () => {
    let wrapper: ShallowWrapper;

    beforeEach(() => {
        wrapper = shallow(<Projects/>);
    });

    it('should render single header row', () => {
        expect(wrapper.find('tbody').find('tr').length).toEqual(1);
    })
});