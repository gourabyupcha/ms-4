const paymentService = require('../services/payment.service');

exports.createPayment = async (req, res, next) => {
  try {
    const { amount, currency, method } = req.body;

    if (!amount || !currency || !method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const payment = await paymentService.createPayment({ amount, currency, method });
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
