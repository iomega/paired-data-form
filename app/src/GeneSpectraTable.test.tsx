import * as React from "react";

import { shallow } from "enzyme";

import { kitchenSinkEnrichedDoc } from './test.fixtures';
import { GeneSpectraTable } from "./GeneSpectraTable";

describe('GenomeMetabolomicsTable', ()=> {
    describe('with schema loaded and kitchen sick sample document rendered', () => {
        let schema: any;
        let comp: any;
        beforeEach(() => {
            schema = require('../public/schema.json');
            comp = shallow(<GeneSpectraTable schema={schema} data={kitchenSinkEnrichedDoc}/>);
        });

        it('should show warning if there are no links', () => {
            const warning = <p>No links between gene clusters and MS2 spectra.</p>;
            expect(comp.contains(warning)).toBeTruthy();
        });
    });
});