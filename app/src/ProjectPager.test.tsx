import * as React from 'react';

import { render, RenderResult, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { ProjectPager } from './ProjectPager';

describe('<ProjectPager>', () => {
    describe('when all hits fit on current page', () => {
        it('should render nothing', () => {
            const nextPage = jest.fn();
            const prevPage = jest.fn();

            const comp = render(<ProjectPager
                nextPage={nextPage}
                prevPage={prevPage}
                page={0}
                page_count={100}
                total={100}
            />);

            expect(comp.container.innerHTML).toEqual('');
        });
    });

    describe('when first page of many', () => {
        let comp: RenderResult;
        let prevPage: jest.Mock;
        let nextPage: jest.Mock;

        beforeEach(() => {
            nextPage = jest.fn();
            prevPage = jest.fn();

            comp = render(<ProjectPager
                nextPage={nextPage}
                prevPage={prevPage}
                page={0}
                page_count={100}
                total={450}
            />);
        });

        it('should display page counts', () => {
            expect(comp.baseElement).toHaveTextContent(/1 - 100 of 450/);
        });

        it('should have prev page button disabled', () => {
            const but = comp.getByTitle('Previous').parentElement;
            expect(but!.className).toContain('disabled');
        });

        it('should have prev page button not disabled', () => {
            const but = comp.getByTitle('Next').parentElement;
            expect(but!.className).not.toContain('disabled');
        });

        describe('when next button clicked', () => {
            beforeEach(() => {
                const but = comp.getByTitle('Next')
                fireEvent.click(but);
            });

            it('should call nextPage()', () => {
                expect(nextPage).toHaveBeenCalled();
            });
        });
    });

    describe('when middle page of many', () => {
        let comp: RenderResult;
        let prevPage: jest.Mock;
        let nextPage: jest.Mock;

        beforeEach(() => {
            nextPage = jest.fn();
            prevPage = jest.fn();

            comp = render(<ProjectPager
                nextPage={nextPage}
                prevPage={prevPage}
                page={1}
                page_count={100}
                total={450}
            />);
        });

        it('should display page counts', () => {
            expect(comp.baseElement).toHaveTextContent(/101 - 200 of 450/);
        });

        it('should have prev page button not disabled', () => {
            const but = comp.getByTitle('Previous').parentElement;
            expect(but!.className).not.toContain('disabled');
        });

        it('should have prev page button not disabled', () => {
            const but = comp.getByTitle('Next').parentElement;
            expect(but!.className).not.toContain('disabled');
        });

        describe('when next button clicked', () => {
            beforeEach(() => {
                const but = comp.getByTitle('Next')
                fireEvent.click(but);
            });

            it('should call nextPage()', () => {
                expect(nextPage).toHaveBeenCalled();
            });
        });

        describe('when prev button clicked', () => {
            beforeEach(() => {
                const but = comp.getByTitle('Previous')
                fireEvent.click(but);
            });

            it('should call prevPage()', () => {
                expect(prevPage).toHaveBeenCalled();
            });
        });
    });

    describe('when last page of many', () => {
        let comp: RenderResult;
        let prevPage: jest.Mock;
        let nextPage: jest.Mock;

        beforeEach(() => {
            nextPage = jest.fn();
            prevPage = jest.fn();

            comp = render(<ProjectPager
                nextPage={nextPage}
                prevPage={prevPage}
                page={4}
                page_count={50}
                total={450}
            />);
        });

        it('should display page counts', () => {
            expect(comp.baseElement).toHaveTextContent(/401 - 450 of 450/);
        });

        it('should have prev page button not disabled', () => {
            const but = comp.getByTitle('Previous').parentElement;
            expect(but!.className).not.toContain('disabled');
        });

        it('should have prev page button not disabled', () => {
            const but = comp.getByTitle('Next').parentElement;
            expect(but!.className).toContain('disabled');
        });

        describe('when prev button clicked', () => {
            beforeEach(() => {
                const but = comp.getByTitle('Previous')
                fireEvent.click(but);
            });

            it('should call prevPage()', () => {
                expect(prevPage).toHaveBeenCalled();
            });
        });
    });
});
