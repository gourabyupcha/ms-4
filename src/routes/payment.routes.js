const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/create_order', paymentController.createPayment);
router.post('/verify_payment', paymentController.createPayment);
router.get('/:id', paymentController.getPaymentStatus);

module.exports = router;
