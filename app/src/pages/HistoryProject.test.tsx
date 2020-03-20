import * as React from "react";

import { render, RenderResult, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from "react-router-dom";

import { HistoryProject } from "./HistoryProject";
import { createMemoryHistory } from "history";
import { useProjectHistory } from "../api";
jest.mock('../api');

function setup() {
    const history = createMemoryHistory();
    const match = {
        params: {
            id: 'project_id1'
        },
        isExact: true,
        path: '/projects/project_id1/history',
        url: 'http://localhost:3000/projects/project_id1/history',
    }
    return render(
        <MemoryRouter>
            <HistoryProject history={history} match={match} location={history.location} />
        </MemoryRouter>
    );
}

describe('<HistoryProject>', () => {
    let wrapper: RenderResult;

    describe('with history loading', () => {
        beforeEach(() => {
            (useProjectHistory as jest.Mock).mockImplementation(() => {
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
            (useProjectHistory as jest.Mock).mockImplementation(() => {
                return {
                    loading: false,
                    data: undefined,
                    error: new TypeError('SomeError'),
                    setData: jest.fn()
                };
            });
            wrapper = setup();
        });

        it('should render error message', () => {
            expect(wrapper.baseElement).toHaveTextContent('SomeError');
        });
    });

    describe('with project without history', () => {
        beforeEach(() => {
            (useProjectHistory as jest.Mock).mockImplementation(() => {
                return {
                    loading: false,
                    error: null,
                    data: {
                        current: require('../../public/examples/paired_datarecord_MSV000078839_example.json'),
                        archived: []
                    }
                };
            });
            wrapper = setup();
        });

        it('should render no history message', () => {
            expect(wrapper.baseElement).toHaveTextContent('Project has no history');
        });
    });

    describe('with project with a archived version', () => {
        beforeEach(() => {
            const archived_project = require('../../public/examples/paired_datarecord_MSV000078839_example.json');
            archived_project.personal.PI_name = 'Incorrect name';
            (useProjectHistory as jest.Mock).mockImplementation(() => {
                return {
                    loading: false,
                    error: null,
                    data: {
                        current: require('../../public/examples/paired_datarecord_MSV000078839_example.json'),
                        archived: [
                            ['project_id0', archived_project]
                        ]
                    }
                };
            });
            wrapper = setup();
        });

        it('should render previous revision message', () => {
            expect(wrapper.baseElement).toHaveTextContent('previous revision');
        });

        it('should have a checked radiobox for the archived version', () => {
            expect(wrapper.getByLabelText('project_id0').checked).toBeTruthy();
        });
    });

    describe('with project with a archived versions', () => {
        beforeEach(() => {
            const archived_project1 = require('../../public/examples/paired_datarecord_MSV000078839_example.json');
            archived_project1.personal.PI_name = 'Incorrect name';
            const archived_project2 = require('../../public/examples/paired_datarecord_MSV000078839_example.json');
            archived_project2.personal.PI_institution = 'Incorrect institute';
            (useProjectHistory as jest.Mock).mockImplementation(() => {
                return {
                    loading: false,
                    error: null,
                    data: {
                        current: require('../../public/examples/paired_datarecord_MSV000078839_example.json'),
                        archived: [
                            ['project_id0', archived_project1],
                            ['project_id-1', archived_project2],
                        ]
                    }
                };
            });
            wrapper = setup();
        });

        it('should render previous revision message', () => {
            expect(wrapper.baseElement).toHaveTextContent('previous revision');
        });

        it('should have a checked radiobox for the first archived version', () => {
            expect(wrapper.getByLabelText('project_id0').checked).toBeTruthy();
        });

        it('should have a unchecked radiobox for the second archived version', () => {
            expect(wrapper.getByLabelText('project_id-1').checked);
        });

        describe('when second archive version is clicked', () => {
            beforeEach(async () => {
                fireEvent.click(wrapper.getByLabelText('project_id-1'));
            });

            it('should have a unchecked radiobox for the first archived version', () => {
                expect(wrapper.getByLabelText('project_id0').checked).toBeFalsy();
            });

            it('should have a checked radiobox for the second archived version', () => {
                expect(wrapper.getByLabelText('project_id-1').checked).toBeTruthy();
            });

        });
    });
});