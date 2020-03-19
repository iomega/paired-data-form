import * as React from "react";

import { render, RenderResult, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from "react-router-dom";

import { PendingProjects } from "./PendingProjects";
import { usePendingProjects, denyPendingProject, approvePendingProject } from "../api";
import { AuthContext } from "../auth";
jest.mock('../api');

function setup() {
    const authValue = {
        token: 'sometoken',
        setToken: jest.fn()
    }
    return render(
        <MemoryRouter>
            <AuthContext.Provider value={authValue}>
                <PendingProjects />
            </AuthContext.Provider>
        </MemoryRouter>
    );
}

describe('<PendingProjects>', () => {
    let wrapper: RenderResult;

    describe('while loading', () => {
        beforeEach(() => {
            (usePendingProjects as jest.Mock).mockImplementation(() => {
                return {
                    loading: true,
                    data: undefined,
                    error: undefined,
                    setData: jest.fn()
                };
            });
            wrapper = setup();
        });

        it('should render loading message', () => {
            expect(wrapper.baseElement).toHaveTextContent('Loading');
        });
    });

    describe('with load error', () => {
        beforeEach(() => {
            (usePendingProjects as jest.Mock).mockImplementation(() => {
                return {
                    loading: false,
                    data: undefined,
                    error: 'SomeError',
                    setData: jest.fn()
                };
            });
            wrapper = setup();
        });

        it('should render error message', () => {
            expect(wrapper.baseElement).toHaveTextContent('SomeError');
        });
    });

    describe('with a pending project loaded', () => {

        beforeEach(() => {
            (usePendingProjects as jest.Mock).mockImplementation(() => {
                return {
                    loading: false,
                    error: null,
                    data: {
                        data: [{
                            _id: 'id1',
                            GNPSMassIVE_ID: 'somegnpsid',
                            PI_name: 'somepi',
                            submitter: 'somesubmitter',
                            nr_genomes: 3,
                            nr_growth_conditions: 4,
                            nr_extraction_methods: 5,
                            nr_instrumentation_methods: 2,
                            nr_genome_metabolmics_links: 123,
                            nr_genecluster_mspectra_links: 42,
                        }]
                    },
                    setData: jest.fn()
                };
            });
            wrapper = setup();
        });

        it('should render a header', () => {
            expect(wrapper.baseElement).toHaveTextContent('Pending projects that require approval');
        });

        it('should have a single row', () => {
            const rows = wrapper.getAllByRole('listitem');
            expect(rows.length).toBe(1);
        });

        describe('the project row', () => {
            let row: HTMLElement;

            beforeEach(() => {
                row = wrapper.getByRole('listitem');
            });

            it('should have approve button', () => {
                expect(row).toHaveTextContent('Approve');
            });

            it('should have gnps id', () => {
                expect(row).toHaveTextContent('somegnpsid');
            });

            it('should have a download button', () => {
                expect(wrapper.getByTitle('Download')).toBeTruthy();
            });
        });

        describe('when approved', () => {
            beforeEach(() => {
                fireEvent.click(wrapper.getByText('Approve'));
            });

            it('should have called api', () => {
                expect(approvePendingProject).toHaveBeenCalledWith('id1', 'sometoken');
            });
        });

        describe('when denied', () => {
            beforeEach(() => {
                fireEvent.click(wrapper.getByText('Deny'));
            });

            it('should have called api', () => {
                expect(denyPendingProject).toHaveBeenCalledWith('id1', 'sometoken');
            });
        });
    });
});