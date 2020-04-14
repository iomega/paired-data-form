import * as React from 'react';

import { render, RenderResult, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event'

import { createMemoryHistory, MemoryHistory, History } from 'history';
import { MemoryRouter, Router } from 'react-router';

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
        let history: MemoryHistory<History.PoorMansUnknown>;

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
            history = createMemoryHistory();
            wrapper = render(
                <Router history={history}>
                    <Projects/>
                </Router>
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

        describe('when `foobar` is put in search box', () => {
            let textbox: any;
            beforeEach(() => {
                textbox = wrapper.getByPlaceholderText('Search ...');
                userEvent.type(textbox, 'foobar');
            });

            it('should have `foobar` in search box', () => {
                expect(textbox.value).toEqual('foobar');
            });

            it('should have a clear button', () => {
                const clear = wrapper.getByTitle('Clear');
                expect(clear).toBeTruthy();
            });

            describe('when search is submitted', () => {
                beforeEach(() => {
                    const search = wrapper.getByTitle('Search');
                    fireEvent.click(search);
                });

                it('should pass search query to api', () => {
                    expect(useProjects).toHaveBeenCalledWith('foobar', undefined);
                });

                it('should include search query in url', () => {
                    expect(history.location.search).toEqual('?q=foobar');
                });

                describe('when clear search button is pressed', () => {
                    beforeEach(() => {
                        (useProjects as jest.Mock).mockClear();
                        const clear = wrapper.getByTitle('Clear');
                        fireEvent.click(clear);
                    });

                    it('should clear search query to api', () => {
                        expect(useProjects).toHaveBeenCalledWith(undefined, undefined);
                    });

                    it('should no longer include search query in url',() => {
                        expect(history.location.search).toEqual('');
                    });

                    it('should have `` in search box', () => {
                        expect(textbox.value).toEqual('');
                    });
                });
            });
        });

        describe('when filter is in url', () => {
            beforeEach(() => {
                const route = '/projects?fk=submitter&fv=submitter3';
                history.push(route);
            });

            it('should render filter text', () => {
                const hint = wrapper.getByText(/submitter3/);
                expect(hint).toBeTruthy();
            });

            it('should have a clear filter button', () => {
                const but = wrapper.getByTitle('Clear filter');
                expect(but).toBeTruthy();
            });

            it('should applied filter to api', () => {
                expect(useProjects).toHaveBeenCalledWith(undefined, {
                    key: 'submitter',
                    value: 'submitter3'
                });
            });

            describe('when clear filter button is clicked', () => {
                beforeEach(() => {
                    const but = wrapper.getByTitle('Clear filter');
                    fireEvent.click(but);
                });

                it('should have removed filter text', () => {
                    const hint = wrapper.queryByText(/submitter3/);
                    expect(hint).toBeFalsy();
                });

                it('should have removed filter from url', () => {
                    expect(history.location.search).toEqual('');
                });
            })
        });
    });
});