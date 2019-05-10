import * as React from "react";

import { shallow } from "enzyme";

import { kitchenSinkDoc } from './test.fixtures';
import { PairedDataProject } from "./PairedDataProject";

describe('PairedDataRecord', ()=> {
    describe('with schema loaded and kitchen sick sample document rendered', () => {
        let schema: any;
        let comp: any;
        beforeEach(() => {
            schema = require('../public/schema.json');
            comp = shallow(<PairedDataProject schema={schema} data={kitchenSinkDoc}/>);
        });

        it('should contain header', ()=> {
            const header = <h3>iOMEGA Paired data record:</h3>;
            expect(comp.contains(header)).toBeTruthy();
        });
    });
});