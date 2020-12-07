import { WebClient } from '@slack/web-api';

import { SLACK_CHANNEL, SLACK_TOKEN } from './secrets';

export async function notifyNewProject(pending_url: string) {
    const slack = new WebClient(SLACK_TOKEN);
    const message = `Good news,\n\nA new or updated project was submitted to the platform.\nPlease visit ${pending_url} to review project.`;
    try {
        await slack.chat.postMessage({
            text: message,
            channel: SLACK_CHANNEL
        });
    } catch (error) {
        console.error(error);
    }
}

export async function notifyPublish2Zenodo(url: string) {
    const slack = new WebClient(SLACK_TOKEN);
    const message = `Great news,\n\nNew or updated projects are now available on Zenodo at ${url}.`;
    try {
        await slack.chat.postMessage({
            text: message,
            channel: SLACK_CHANNEL
        });
    } catch (error) {
        console.error(error);
    }

}
