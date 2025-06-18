const axios = require('axios');

const BROKER_SERVICE_URL = process.env.BROKER_SERVICE_URL;

const publishEvent = async (type, payload) => {
  try {
    await axios.post(`${BROKER_SERVICE_URL}/api/events`, { type, payload });
    console.log(`📨 Sent event: ${type}`);
  } catch (err) {
    console.error('❌ Event publish failed:', err.message);
  }
};

module.exports = { publishEvent };
