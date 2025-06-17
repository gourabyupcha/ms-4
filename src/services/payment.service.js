const { v4: uuidv4 } = require('uuid');

const payments = new Map(); // In-memory store

exports.createPayment = async ({ amount, currency, method }) => {
  const id = uuidv4();
  const payment = {
    id,
    amount,
    currency,
    method,
    status: 'PENDING',
    createdAt: new Date(),
  };

  // Simulate async payment processing (e.g., calling Stripe)
  setTimeout(() => {
    payment.status = 'COMPLETED'; // Simulated payment success
  }, 2000);

  payments.set(id, payment);
  return payment;
};

exports.getPaymentById = async (id) => {
  return payments.get(id);
};
