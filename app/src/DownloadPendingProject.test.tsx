import * as React from "react";

import { shallow } from "enzyme";
import { saveAs } from "file-saver";

import { DownloadPendingProject } from "./DownloadPendingProject";
import { fetchPendingProject } from "./api";
import { kitchenSinkEnrichedDoc } from "./test.fixtures";

jest.mock('file-saver')
jest.mock('./api');

describe('<DownloadPendingProject/>', () => {
    let project_id: string;
    let token: string;
    let wrapper: any;
    describe('with mocked project', () => {
        beforeEach(() => {
            (fetchPendingProject as jest.Mock).mockImplementation(() => {
                return new Response(JSON.stringify(kitchenSinkEnrichedDoc));
            });
            project_id = 'some-project-id';
            token = 'my-token';
            wrapper = shallow(<DownloadPendingProject project_id={project_id} token={token}/>);
        });

        it('should contain a download title', () => {
            expect(wrapper.find('[title="Download"]')).toHaveLength(1);
        });

        describe('when clicked', () => {
            beforeEach(() => {
                wrapper.simulate('click');
            });

            it('should fetch pending project from API', () => {
                expect(fetchPendingProject).toHaveBeenCalledWith(project_id, token);
            });

            it('should have called saveAs() with project as JSON document', async () => {
                expect(saveAs).toHaveBeenCalled();
                const file = (saveAs as jest.Mock).mock.calls[0][0];
                // File.text() gives TypeError, workaround wrap in Response to get content of file
                const body = await (new Response(file)).text();
                const expected = kitchenSinkEnrichedDoc.project;
                expect(JSON.parse(body)).toEqual(expected);
            });
        });
    });
});