import * as React from 'react';

import { render, RenderResult } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { DownloadPage } from './DownloadPage';

describe('<DownloadPage/>', () => {
    let wrapper: RenderResult;

    beforeEach(() => {
        wrapper = render(<DownloadPage />);
    });

    it('should render doi of dataset', () => {
        expect(wrapper.baseElement).toHaveTextContent('10.5281/zenodo.3736430');
    });

    it('should render zenodo url of dataset', () => {
        const a = wrapper.getByTitle('Download');
        expect(a.getAttribute('href')).toEqual('https://doi.org/10.5281/zenodo.3736430');
    });
});