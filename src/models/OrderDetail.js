const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderDetail = sequelize.define('OrderDetail', {
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
  productAttributeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_attribute_id'
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'product_name'
  },
  productImage: {
    type: DataTypes.STRING(500),
    field: 'product_image'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'quantity'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'unit_price'
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'total'
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
  tableName: 'order_detail',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = OrderDetail;
