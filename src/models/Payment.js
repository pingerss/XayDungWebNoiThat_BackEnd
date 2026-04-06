const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_id'
  },
  method: {
    type: DataTypes.ENUM('vnpay', 'cod'),
    allowNull: false,
    field: 'method'
  },
  transactionId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'transaction_id'
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'amount'
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'status'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'payment',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Payment;
