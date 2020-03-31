import * as React from 'react';

import { render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { useVersionInfo } from './api';
import { VersionInfo } from './VersionInfo';
jest.mock('./api');

describe('<VersionInfo/>', () => {
    let wrapper: RenderResult;

    describe('while loading', () => {
        beforeEach(() => {
            (useVersionInfo as jest.Mock).mockImplementation(() => {
                return {
                    loading: true,
                    error: null,
                    data: undefined,
                    setData: jest.fn()
                };
            }
            );
            wrapper = render(<VersionInfo />);
        });

        it('should render loading message', () => {
            expect(wrapper.getByText('Loading ...')).toBeTruthy();
        });
    });

    describe('when fetch fails', () => {
        beforeEach(() => {
            (useVersionInfo as jest.Mock).mockImplementation(() => {
                return {
                    loading: false,
                    error: new Error('something bad happened'),
                    data: undefined,
                    setData: jest.fn()
                };
            }
            );
            wrapper = render(<VersionInfo />);
        });

        it('should render loading message', () => {
            expect(wrapper.getByText(/something bad happened/)).toBeTruthy();
        });
    });

    describe('when version info loaded', () => {

        beforeEach(() => {
            (useVersionInfo as jest.Mock).mockImplementation(() => {
                return {
                    data: {
                        doi: 'somedoi',
                        api: '1.2.3'
                    }
                }
            });

            wrapper = render(<VersionInfo />);
        });

        it('should render doi', () => {
            expect(wrapper.baseElement).toHaveTextContent('somedoi');
        });

        it('should render api version', () => {
            expect(wrapper.baseElement).toHaveTextContent('1.2.3');
        });
    });

});