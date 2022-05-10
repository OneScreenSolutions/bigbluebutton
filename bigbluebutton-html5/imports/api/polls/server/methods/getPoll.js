import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function getPoll() {
  try {
    const {meetingId} = extractCredentials(this.userId);

    check(meetingId, String);

    const poll = Polls.findOne({ meetingId }, { sort: { 'created_at' : -1 }}) // TODO--send pollid from client
    if (!poll) {
      Logger.info(`No poll found in meetingId: ${meetingId}`);
      return false;
    }
    Logger.info(`Poll found in meetingId: ${meetingId}`);
    return poll;
  } catch (err) {
    Logger.error(`Exception while getting poll: ${err.stack}`);
  }
}
