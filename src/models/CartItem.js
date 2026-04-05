const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  cartId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Cart Id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Product Id'
  },
  productAttributeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Product Attribute Id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Quantity'
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'Price'
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
  tableName: 'Cart Item',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = CartItem;
