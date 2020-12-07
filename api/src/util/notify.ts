import { WebClient } from '@slack/web-api';

import { SLACK_CHANNEL, SLACK_TOKEN } from './secrets';

export async function notifyNewProject(submitter: string, pending_url: string) {
    const slack = new WebClient(SLACK_TOKEN);
    const message = `Good news,\n\nA new or updated project was submitted by '${submitter}' to the platform.\nVisit ${pending_url} to review project.`;
    await slack.chat.postMessage({
        text: message,
        channel: SLACK_CHANNEL
    });
}
