import * as React from "react";

import { render } from "enzyme";
import { CheckList } from "./CheckList";

describe('CheckList', () => {
    it('should render', () => {
        const comp = render(<CheckList/>);
        expect(comp.text()).toContain('checklist');
    });
});
