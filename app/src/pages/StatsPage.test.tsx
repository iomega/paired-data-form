import React from 'react';
import { shallow } from 'enzyme';

import { StatsPage } from './StatsPage';

// Mock useStats so it returns data immediately
jest.mock('../api', () => ({
    useStats: () => {
        return {
            loading: false,
            error: null,
            data: {
                global: {
                    projects: 1,
                    principal_investigators: 2,
                    metabolome_samples: 3,
                },
                top: {
                    principal_investigators: [['me', 4]],
                    submitters: [['me', 5]],
                    genome_types: [['genome', 6]],
                    species: [['Human', 7]],
                    instruments_types: [['Time-of-flight (TOF)', 8]],
                    growth_media: [['A1 medium', 9]],
                    solvents: [['Methanol', 10]]
                }
            }
        };
    }
}));


describe('<StatsPage/>', () => {
    let wrapper: any;

    beforeEach(() => {
        wrapper = shallow(<StatsPage/>);
    });

    it('should render header', () => {
        expect(wrapper.find('h2')).toHaveLength(1);
    })
})