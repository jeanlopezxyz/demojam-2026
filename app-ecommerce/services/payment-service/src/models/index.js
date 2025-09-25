const Payment = require('./Payment');
const PaymentMethod = require('./PaymentMethod');
const Refund = require('./Refund');

// Define associations
PaymentMethod.hasMany(Payment, {
  foreignKey: 'paymentMethodId',
  as: 'payments'
});

Payment.belongsTo(PaymentMethod, {
  foreignKey: 'paymentMethodId',
  as: 'paymentMethod'
});

Payment.hasMany(Refund, {
  foreignKey: 'paymentId',
  as: 'refunds',
  onDelete: 'CASCADE'
});

Refund.belongsTo(Payment, {
  foreignKey: 'paymentId',
  as: 'payment'
});

module.exports = {
  Payment,
  PaymentMethod,
  Refund
};