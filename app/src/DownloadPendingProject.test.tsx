import * as React from "react";

import { shallow } from "enzyme";
import { DownloadPendingProject } from "./DownloadPendingProject";

describe('<DownloadPendingProject/>', () => {
    let project_id: string;
    let token: string;
    let wrapper: any;
    describe('with mocked project', () => {
        beforeEach(() => {
            project_id = 'some-project-id';
            token = 'my-token';
            wrapper = shallow(<DownloadPendingProject project_id={project_id} token={token}/>);
        });

        it('should contain a download title', () => {
            expect(wrapper.find('[title="Download"]')).toHaveLength(1);
        });
    });
});