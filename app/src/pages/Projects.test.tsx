import * as React from 'react';

import { render, RenderResult, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router';

import { Projects } from './Projects';
import { useProjects } from '../api';
jest.mock('../api');

describe('<Projects>', () => {
    let wrapper: RenderResult;

    describe('while loading', () => {
        beforeEach(() => {
            (useProjects as jest.Mock).mockImplementation(() => {
                return {
                    loading: true,
                    error: null,
                    data: undefined,
                    setData: jest.fn()
                };
            }
            );
            wrapper = render(
                <MemoryRouter>
                    <Projects/>
                </MemoryRouter>
            );
        });

        it('should render loading message', () => {
            expect(wrapper.getByText('Loading ...')).toBeTruthy();
        });
    });

    describe('when fetch fails', () => {
        beforeEach(() => {
            (useProjects as jest.Mock).mockImplementation(() => {
                return {
                    loading: false,
                    error: new Error('something bad happened'),
                    data: undefined,
                    setData: jest.fn()
                };
            }
            );
            wrapper = render(
                <MemoryRouter>
                    <Projects/>
                </MemoryRouter>
            );
        });

        it('should render loading message', () => {
            expect(wrapper.getByText(/something bad happened/)).toBeTruthy();
        });
    });

    describe('with 2 projects loaded', () => {
        beforeEach(() => {
            const data = {
                loading: false,
                error: null,
                data: [{
                    _id: 'id1',
                    GNPSMassIVE_ID: 'somegnpsid',
                    PI_name: 'somepi',
                    submitters: 'somesubmitter',
                    nr_genomes: 3,
                    nr_growth_conditions: 4,
                    nr_extraction_methods: 5,
                    nr_instrumentation_methods: 2,
                    nr_genome_metabolmics_links: 123,
                    nr_genecluster_mspectra_links: 42,
                }, {
                    _id: 'id2',
                    GNPSMassIVE_ID: 'othergnpsid',
                    PI_name: 'otherpi',
                    submitters: 'othersubmitter',
                    nr_genomes: 3,
                    nr_growth_conditions: 4,
                    nr_extraction_methods: 5,
                    nr_instrumentation_methods: 2,
                    nr_genome_metabolmics_links: 123,
                    nr_genecluster_mspectra_links: 42,
                }]
            };
            (useProjects as jest.Mock).mockImplementation(() => {
                return {
                    ...data,
                    setData: (ndata: any) => data.data = ndata.data
                };
            }
            );
            wrapper = render(
                <MemoryRouter>
                    <Projects/>
                </MemoryRouter>
            );
        });
    
        it('should render 3 rows', () => {
            expect(wrapper.getAllByRole('row').length).toEqual(3);
        });

        describe('click on PI column header', () => {
            beforeEach(() => {
                const button = wrapper.getByText('Principal investigator');
                fireEvent.click(button);
            });

            it('should have sorted rows on PI', () => {
                const cells = wrapper.getAllByRole('cell');
                expect(cells[1].textContent).toEqual('otherpi');
                expect(cells[10].textContent).toEqual('somepi');
            });
        });
    });
});