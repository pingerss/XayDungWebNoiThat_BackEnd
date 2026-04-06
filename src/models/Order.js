const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'customer_id'
  },
  promotionId: {
    type: DataTypes.INTEGER,
    field: 'promotion_id'
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'customer_name'
  },
  customerPhone: {
    type: DataTypes.STRING(15),
    allowNull: false,
    field: 'customer_phone'
  },
  customerAddress: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'customer_address'
  },
  method: {
    type: DataTypes.ENUM('vnpay', 'cod'),
    allowNull: false,
    field: 'method'
  },
  subtotal: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'subtotal'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'discount_amount'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'total_price'
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'shipping', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    field: 'status'
  },
  note: {
    type: DataTypes.TEXT,
    field: 'note'
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
  tableName: 'order',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Order;
