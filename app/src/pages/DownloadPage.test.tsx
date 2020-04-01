import * as React from 'react';

import { render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { DownloadPage } from './DownloadPage';
import { useVersionInfo } from '../api';
jest.mock('../api');

describe('<DownloadPage/>', () => {
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
            wrapper = render(<DownloadPage />);
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
            wrapper = render(<DownloadPage />);
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
                        dataset: {
                            zenodo: 'somezenodo',
                            doi: 'somedoi',
                        },
                        api: '1.2.3'
                    }
                }
            });

            wrapper = render(<DownloadPage />);
        });

        it('should render doi of dataset', () => {
            expect(wrapper.baseElement).toHaveTextContent('somedoi');
        });

        it('should render zenodo url of dataset', () => {
            const a = wrapper.getByTitle('Download');
            expect(a.getAttribute('href')).toEqual('somezenodo');
        });

    });

});