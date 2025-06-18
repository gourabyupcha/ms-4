const { getChannel } = require('../utils/rabbitmq');
const { processPayment } = require('../services/payment.service');

const consumeBookingAccepted = async () => {
  const channel = getChannel();

  await channel.assertQueue('booking.accepted');
  channel.consume('booking.accepted', async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      console.log('📥 Received booking.accepted:', data);

      const result = await processPayment(data);

      // Publish new event
      const eventType = result.status === 'success' ? 'payment.success' : 'payment.failed';
      channel.assertQueue(eventType);
      channel.sendToQueue(
        eventType,
        Buffer.from(JSON.stringify(result))
      );

      channel.ack(msg);
    }
  });
};

module.exports = { consumeBookingAccepted };
