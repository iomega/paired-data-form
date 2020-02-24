import * as React from "react";

import { shallow } from "enzyme";

import { kitchenSinkEnrichedDoc, minimalGrowthMediumDoc } from './test.fixtures';
import { GenomeMetabolomicsTable } from "./GenomeMetabolomicsTable";

describe('GenomeMetabolomicsTable', () => {

    describe('with schema loaded', () => {
        let schema: any;
        beforeEach(() => {
            schema = require('../public/schema.json');
        });

        describe('with kitchen sick sample document rendered', () => {
            let comp: any;
            beforeEach(() => {
                comp = shallow(<GenomeMetabolomicsTable schema={schema} data={kitchenSinkEnrichedDoc} />);
            });
    
            it('should contain a download link', () => {
                const fn = 'paired-' + kitchenSinkEnrichedDoc._id + '-genome-metabolome.tsv';
                expect(comp.find(`[download="${fn}"]`)).toBeTruthy();
            });
    
            it('should have 5 columns', () => {
                expect(comp.find('th').length).toBe(5);
            });
        });
    
        describe('with minimal growth medium', () => {
            let comp: any;
            beforeEach(() => {
                comp = shallow(<GenomeMetabolomicsTable schema={schema} data={minimalGrowthMediumDoc} />);
            });
            
            it('should have 5 columns', () => {
                expect(comp.find('th').length).toBe(5);
            });
        })
    })
});