const Payment = require('../models/Payment');
const crypto = require('crypto');
const razorpay = require('../config/razorpay'); // adjust path to your razorpay instance
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');

exports.createOrder = async ({ amount, currency, bookingId }) => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: bookingId
    };

    const order = await razorpay.orders.create(options);

    // save order data to mongo

    console.log(order)
    return order;
  } catch (error) {
    throw new Error('Error creating order: ' + error.message);
  }
};

exports.verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const secret = razorpay.key_secret;
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  try {
    const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);
    if (isValidSignature) {
      // Update the order with payment details
      const orders = readData();
      const order = orders.find(o => o.order_id === razorpay_order_id);
      if (order) {
        order.status = 'paid';
        order.payment_id = razorpay_payment_id;
        writeData(orders);
      }
      res.status(200).json({ status: 'ok' });
      console.log("Payment verification successful");
    } else {
      res.status(400).json({ status: 'verification_failed' });
      console.log("Payment verification failed");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Error verifying payment' });
  }
};

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
