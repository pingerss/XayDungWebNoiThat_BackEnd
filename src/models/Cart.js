const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Cart = sequelize.define('Cart', {
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
  sessionId: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Session Id'
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
  tableName: 'Cart',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Cart;
