const paymentService = require('../services/payment.service');

exports.createPayment = async (req, res, next) => {
  try {
    const { amount, currency, bookingId } = req.body;

    if (!amount || !currency || !bookingId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payment = await paymentService.createOrder({ amount, currency, bookingId });
    res.status(201).json(payment);
  } catch (err) {
    next(err);
  }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    res.status(200).json(payment);
  } catch (err) {
    next(err);
  }
};
