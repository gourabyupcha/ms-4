const Payment = require('../models/Payment');
const crypto = require('crypto');
const razorpay = require('../config/razorpay'); // adjust path to your razorpay instance
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { getOrdersCollection } = require('../config/mongo');

exports.createOrder = async ({ userId, amount, currency, bookingId }) => {
  try {
    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: bookingId,
    };

    const orders = getOrdersCollection();
    const order = await razorpay.orders.create(options);

    // Prepare the order data to save
    const orderData = {
      orderId: order.id, // Razorpay Order ID
      amount: order.amount, // In paise
      currency: order.currency,
      receipt: order.receipt,
      status: order.status, // 'created'
      userId: userId,
      bookingId: bookingId, // Your internal booking ID
      amount_paid: order.amount_paid,
      amount_due: order.amount_due,
      created_at: new Date(order.created_at * 1000), // Razorpay gives timestamp in seconds
      createdAt: new Date(), // Local timestamp for tracking
    };

    // Insert into MongoDB
    await orders.insertOne(orderData);
    console.log(order);
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
      const orders = getOrdersCollection()
      const result = await orders.updateOne(
        { orderId: razorpay_order_id }, // Match by Razorpay order ID
        {
          $set: {
            status: 'paid',
            payment_id: razorpay_payment_id,
            updatedAt: new Date(),
          },
        },
      );

      if (result.matchedCount === 0) {
        console.log('No order found to update');
      } else {
        console.log('Order updated successfully');
      }
      return result;
    } else {
      return ({ status: 'verification_failed' });
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
    transactionId: payment.transactionId,
  };
};
