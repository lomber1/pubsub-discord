const { colors } = require('./colors');
const { Field } = require('./field');
const axios = require('axios').default;

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 * Send message to discord server using webhooks.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.sendMessage = (event, context) => {
  // Get webhook URL
  const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || null;

  if (DISCORD_WEBHOOK === null) {
    console.log('DISCORD_WEBHOOK is null')
    return;
  }

  // Decode message from Pub/Sub
  const messageJson = event.data
    ? Buffer.from(event.data, 'base64').toString()
    : 'where message?';

  if (messageJson === 'where message?') {
    console.error(`Something went wrong when decoding message, event: ${event}`)
    return;
  }

  // Catch errors durning JSON parse.
  let message;
  try {
    message = JSON.parse(messageJson);
  } catch (e) {
    console.error('An error has occured while parsing JSON:')
    console.error(e);
    return;
  }

  const { incident } = message;

  // Prepare message
  const data = {
    username: 'Google Cloud Alert',
    embeds: [
      {
        title: incident.policy_name,
        color: incident.state === 'open' ? colors.RED : colors.GREEN,
        fields: [
          Field('Resource', incident.resource_name),
          Field('Policy', incident.policy_name),
          Field('Condition', incident.condition_name),
          Field('Summary', incident.summary),
          Field('State', incident.state),
          Field('URL', incident.url),
        ]
      },
    ],
  };

  // Send message to Discord
  axios
    .post(DISCORD_WEBHOOK, data)
    .then((response) => {
      console.log(`Successfully sent message. Response code: ${response.status}`);
    })
    .catch((error) => {
      console.error(error)
    });
};
