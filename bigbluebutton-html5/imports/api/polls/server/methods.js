import { Meteor } from 'meteor/meteor';
import publishTypedVote from './methods/publishTypedVote';
import publishVote from './methods/publishVote';
import publishPoll from './methods/publishPoll';
import startPoll from './methods/startPoll';
import stopPoll from './methods/stopPoll';
import getPoll from './methods/getPoll'

Meteor.methods({
  publishVote,
  publishTypedVote,
  publishPoll,
  startPoll,
  stopPoll,
  getPoll
});
