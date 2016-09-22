var moment = require('moment');

var Slack = require('slack-node');
var slack = new Slack();
slack.setWebhook(process.env.SLACK_WEBHOOK);

var _ = require('lodash');
var async = require('async');
var moment = require('moment');

var template = _.template('*${EventName}* from *${Username}*');

var attachment_text_template = _.template('<https://us-west-1.console.aws.amazon.com/cloudtrail/home?region=${region}|Open CloudTrail Console>');
var event_link_template = _.template('<https://us-west-1.console.aws.amazon.com/cloudtrail/home?region=${region}#/events?EventId=${eventID}|${eventID}>');

function friendly_title (field) {
  return field.replace(/([A-Z])/g, ' $1')
              .replace(/^./, function(str){ return str.toUpperCase(); });
}

var eventFields = ['eventSource', 'eventName', 'awsRegion',
                   'sourceIPAddress', 'userAgent', 'eventTime', 'eventID'];

var queue = async.queue(function (event, callback) {
  event.CloudTrailEvent = typeof event.CloudTrailEvent === 'string' ? JSON.parse(event.CloudTrailEvent) : event.CloudTrailEvent;
  event.EventTimeFromNow = moment(event.EventTime).fromNow();

  // console.dir(event);

  var color = event.EventName.indexOf('Delete') > -1 ? 'danger' : 'good';

  var meta = _(event.CloudTrailEvent)
              .pick(eventFields)
              .map(function (value, key) {

                if (key === 'eventTime') {
                  value = moment(value).utc().format('hh:mm:ss a');
                }
                if (key === 'eventID') {
                  value = event_link_template({ region: event.CloudTrailEvent.awsRegion, eventID: value });
                }

                return {
                  title: friendly_title(key),
                  value: value,
                  short: true
                };
              }).value();

  slack.webhook({
    text: template(event),
    attachments: [
      {
        text: attachment_text_template({ region: event.CloudTrailEvent.awsRegion }),
        color: color,
        fields: meta
      }
    ]
  }, callback);
}, 1);

module.exports.sendEvent = function (event, callback) {
  queue.push(event, callback);
};
