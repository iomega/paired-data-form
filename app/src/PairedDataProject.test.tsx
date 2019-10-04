import * as React from "react";

import { shallow } from "enzyme";

import { kitchenSinkEnrichedDoc } from './test.fixtures';
import { PairedDataProject } from "./PairedDataProject";
import { EnrichedProjectDocument } from "./summarize";

describe('PairedDataRecord', ()=> {
    describe('with schema loaded and kitchen sick sample document rendered', () => {
        let schema: any;
        let comp: any;
        beforeEach(() => {
            schema = require('../public/schema.json');
            comp = shallow(<PairedDataProject schema={schema} project={kitchenSinkEnrichedDoc as EnrichedProjectDocument}/>);
        });

        it('should contain header', ()=> {
            const header = <h3>iOMEGA Paired data project: kitchen-sink-id</h3>;
            expect(comp.contains(header)).toBeTruthy();
        });
    });
});