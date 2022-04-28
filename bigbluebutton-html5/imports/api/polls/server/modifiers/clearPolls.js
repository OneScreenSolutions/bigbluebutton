import Polls from '/imports/api/polls';
import Logger from '/imports/startup/server/logger';

///updating all polls to published
export default function clearPolls(meetingId) {
  if (meetingId) {
    try {
      const selector = {
        meetingId,
        isPublished: false,
      };
    
      const modifier = {
        $set: {isPublished: true},
      };
      const numberAffected = Polls.update(selector, modifier);

      if (numberAffected) {
        Logger.info(`Published all Polls to true in meetingId(${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error on clearing Polls (${meetingId}). ${err}`);
    }
  } else {
    try {
      // const numberAffected = Polls.remove({});

      // if (numberAffected) {
      //   Logger.info('Cleared Polls (all)');
      // }
    } catch (err) {
      Logger.info(`Error on clearing Polls (all). ${err}`);
    }
  }
}
