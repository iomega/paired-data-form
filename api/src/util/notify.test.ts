import { WebClient } from '@slack/web-api';
import { notifyNewProject, notifyPublish2Zenodo } from './notify';

jest.mock('./secrets', () => {
    return {
        SLACK_TOKEN: 'fake-slack-token',
        SLACK_CHANNEL: 'fake-slack-channel'
    };
});
const mockPostMessage = jest.fn();
jest.mock('@slack/web-api', () => {
    return {
        WebClient: jest.fn().mockImplementation(() => {
            return {
                chat: {
                    postMessage: mockPostMessage
                }
            };
        })
    };
});

describe('notifyNewProject()', () => {
    it('should post a Slack message', async () => {
        await notifyNewProject('https://example.com/new-project-id');

        expect(WebClient).toHaveBeenCalledWith('fake-slack-token');
        expect(mockPostMessage).toHaveBeenCalledWith({
            channel: 'fake-slack-channel',
            text: `Good news,\n\nA new or updated project was submitted to the platform.\nPlease visit https://example.com/new-project-id to review project.`
        });
    });
});

describe('notifyPublish2Zenodo()', () => {
    it('should post a Slack message', async () => {
        await notifyPublish2Zenodo('https://zenodo.org/someid');

        expect(WebClient).toHaveBeenCalledWith('fake-slack-token');
        expect(mockPostMessage).toHaveBeenCalledWith({
            channel: 'fake-slack-channel',
            text: `Great news,\n\nNew or updated projects are now available on Zenodo at https://zenodo.org/someid.`
        });
    });
});
