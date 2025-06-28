const paymentService = require('../services/payment.service');

exports.createPayment = async (req, res, next) => {
  try {
    const { userId, amount, currency, bookingId } = req.body;

    if (!userId || !amount || !currency || !bookingId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await paymentService.createOrder({ userId, amount, currency, bookingId });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({error: err})
  }
};

exports.verifyOrder = async(req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await paymentService.verifyPayment({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({error: err})
  }
}

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    res.status(200).json(payment);
  } catch (err) {
    res.status(500).json({error: err})
  }
};
