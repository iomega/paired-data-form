import * as React from 'react';
import { Publications } from './Publications';
import { render } from '@testing-library/react';

describe('<Publications/>', () => {
    describe('zero publications', () => {
        it('should render nothing', () => {
            const comp = render(<Publications publications=""/>);
            expect(comp.container.innerHTML).toEqual('');
        });
    });

    describe('single doi', () => {
        it('should render as single linked doi', () => {
            const pubs = '10.5281/zenodo.3736430';
            const comp = render(<Publications publications={pubs}/>);
            const link = comp.getByText(pubs);
            expect(link.getAttribute('href')).toEqual('https://doi.org/10.5281/zenodo.3736430');
        });
    });

    describe('single pubmed', () => {
        it('should render as single linked pubmed', () => {
            const pubs = '28335604';
            const comp = render(<Publications publications={pubs}/>);
            const link = comp.getByText(pubs);
            expect(link.getAttribute('href')).toEqual('https://identifiers.org/pubmed:28335604');
        });
    });

    describe('comma seperated list', () => {
        it('should render 2 links', () => {
            const pubs = '28335604,10.5281/zenodo.3736430';
            const comp = render(<Publications publications={pubs}/>);
            const link1 = comp.getByText('28335604');
            expect(link1.getAttribute('href')).toBeTruthy();
            const link2 = comp.getByText('10.5281/zenodo.3736430');
            expect(link2.getAttribute('href')).toBeTruthy();
        });
    });

    describe('comma and space seperated list', () => {
        it('should render 2 links', () => {
            const pubs = '28335604, 10.5281/zenodo.3736430';
            const comp = render(<Publications publications={pubs}/>);
            const link1 = comp.getByText('28335604');
            expect(link1.getAttribute('href')).toBeTruthy();
            const link2 = comp.getByText('10.5281/zenodo.3736430');
            expect(link2.getAttribute('href')).toBeTruthy();
        });
    });
});
