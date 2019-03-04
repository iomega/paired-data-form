import * as React from "react";

import { shallow } from "enzyme";

import { kitchenSinkDoc } from './test.fixtures';
import { GenomeMetabolomicsTable } from "./GenomeMetabolomicsTable";

describe('GenomeMetabolomicsTable', ()=> {
    describe('with schema loaded and kitchen sick sample document rendered', () => {
        let schema: any;
        let comp: any;
        beforeEach(() => {
            schema = require('../public/schema.json');
            comp = shallow(<GenomeMetabolomicsTable schema={schema} data={kitchenSinkDoc}/>);
        });

        it('should contain a download link', ()=> {
            const fn = 'paired-' + kitchenSinkDoc.metabolomics.GNPSMassIVE_ID + '-genome-metabolome.tsv';
            expect(comp.find(`[download="${fn}"]`)).toBeTruthy();
        });
    });
});