import { WebClient } from '@slack/web-api';

import { SLACK_CHANNEL, SLACK_ENABLED, SLACK_TOKEN } from './secrets';

async function postMessage2Slack(message: string) {
    if (!SLACK_ENABLED) {
        return;
    }
    const slack = new WebClient(SLACK_TOKEN);
    try {
        await slack.chat.postMessage({
            text: message,
            channel: SLACK_CHANNEL
        });
    } catch (error) {
        console.error(error);
    }
}

export async function notifyNewProject(pending_url: string) {
    const message = `Good news,\n\nA new or updated project was submitted to the platform.\nPlease visit ${pending_url} to review project.`;
    return postMessage2Slack(message);
}

export async function notifyPublish2Zenodo(url: string) {
    const message = `Great news,\n\nNew or updated projects are now available on Zenodo at ${url}.`;
    return postMessage2Slack(message);
}
