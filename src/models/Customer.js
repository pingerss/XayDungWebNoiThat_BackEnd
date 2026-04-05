const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Customer = sequelize.define('Customer', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'Name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'Email'
  },
  password: {
    type: DataTypes.STRING(255),
    field: 'Password'
  },
  idGoogle: {
    type: DataTypes.STRING(255),
    field: 'Id Google'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'Is Active'
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
  tableName: 'Customer',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Customer;
