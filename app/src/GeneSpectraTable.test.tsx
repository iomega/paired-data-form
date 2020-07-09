import * as React from "react";

import { shallow } from "enzyme";

import { kitchenSinkEnrichedDoc } from './test.fixtures';
import { GeneSpectraTable } from "./GeneSpectraTable";

describe('<GenomeMetabolomicsTable/>', () => {
    describe('with schema loaded', () => {
        let schema: any;
        let comp: any;
        beforeEach(() => {
            schema = require('../public/schema.json');
        });

        describe('with kitchen sick sample document', () => {
            beforeEach(() => {
                comp = shallow(<GeneSpectraTable schema={schema} data={kitchenSinkEnrichedDoc} />);
            });

            it('should show warning if there are no links', () => {
                const warning = <p>No links between biosynthetic gene clusters and MS/MS spectra.</p>;
                expect(comp.contains(warning)).toBeTruthy();
            });
        });

        describe('with example document', () => {
            beforeAll(() => {
                const project = require('../public/examples/paired_datarecord_MSV000078839_example.json');
                const eproject = {
                    _id: 'someprojectid',
                    project
                }
                comp = shallow(<GeneSpectraTable schema={schema} data={eproject} />);
            });

            it('should not show warning if there are no links', () => {
                const warning = <p>No links between biosynthetic gene clusters and MS/MS spectra.</p>;
                expect(comp.contains(warning)).toBeFalsy();
            });

            it('should contain BGC0000827', () => {
                expect(comp.html()).toContain('BGC0000827');
            });

            it('should contain "molecule of MS2 scan 977106"', () => {
                expect(comp.html()).toContain('molecule of MS2 scan 977106');
            })

            it('should contain "GNPS molecular family"', () => {
                expect(comp.html()).toContain('GNPS molecular family');
            })
        });
    });
});