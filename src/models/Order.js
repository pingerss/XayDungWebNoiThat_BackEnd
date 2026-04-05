const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Customer Id'
  },
  promotionId: {
    type: DataTypes.INTEGER,
    field: 'Promotion Id'
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Customer Name'
  },
  customerPhone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    field: 'Customer Phone'
  },
  customerAddress: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Customer Address'
  },
  method: {
    type: DataTypes.ENUM('vnpay', 'cod'),
    allowNull: false,
    field: 'Method'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'Subtotal'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'Discount Amount'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'Total Price'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'Status'
  },
  note: {
    type: DataTypes.TEXT,
    field: 'Note'
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
  tableName: 'Order',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Order;
