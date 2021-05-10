const axios = require('axios').default;

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.sendMessage = (event, context) => {
  const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || null;

  if (DISCORD_WEBHOOK === null) {
    console.log('DISCORD_WEBHOOK is null')
    return;
  }

  const message = event.data
    ? Buffer.from(event.data, 'base64').toString()
    : 'where message?';

  if (message === 'where message?') {
    console.error(`Something went wrong when decoding message, event: ${event}`)
  }

  axios.post(DISCORD_WEBHOOK, {
    embeds: [
      {
        title: message,
        color: 15158332
      }
    ]
  }).then((response) => {
    console.log(`Response code: ${response.status}`);
  }).catch((error) => {
    console.error(error)
  });
};
