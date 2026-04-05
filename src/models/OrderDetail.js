const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const OrderDetail = sequelize.define('OrderDetail', {
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
  productAttributeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Product Attribute Id'
  },
  productName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Product Name'
  },
  productImage: {
    type: DataTypes.STRING(500),
    field: 'Product Image'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Quantity'
  },
  unitPrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'Unit Price'
  },
  total: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'Total'
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
  tableName: 'Order Detail',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = OrderDetail;
