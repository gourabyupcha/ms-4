const Payment = require('../models/Payment');

exports.processPayment = async (bookingData) => {
  const { bookingId, buyerId, sellerId } = bookingData;
  const amount = 500;

  const payment = new Payment({ bookingId, buyerId, sellerId, amount });
  await payment.save();

  const success = Math.random() > 0.2;
  payment.status = success ? 'success' : 'failed';
  payment.transactionId = `txn_${Date.now()}`;
  await payment.save();

  return {
    bookingId,
    paymentId: payment._id,
    status: payment.status,
    transactionId: payment.transactionId
  };
};
