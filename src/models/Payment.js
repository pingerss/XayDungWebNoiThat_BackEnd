const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Order Id'
  },
  method: {
    type: DataTypes.ENUM('vnpay', 'cod'),
    allowNull: false,
    field: 'Method'
  },
  transactionId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Transaction Id'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'Amount'
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'Status'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'Created At'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'Updated At'
  }
}, {
  tableName: 'Payment',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Payment;
