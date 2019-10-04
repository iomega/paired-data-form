import * as React from "react";

import { shallow } from "enzyme";

import { kitchenSinkEnrichedDoc } from './test.fixtures';
import { GenomeMetabolomicsTable } from "./GenomeMetabolomicsTable";

describe('GenomeMetabolomicsTable', () => {
    describe('with schema loaded and kitchen sick sample document rendered', () => {
        let schema: any;
        let comp: any;
        beforeEach(() => {
            schema = require('../public/schema.json');
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
});