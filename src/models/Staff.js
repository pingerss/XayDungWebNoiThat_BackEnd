const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Email'
  },
  password: {
    type: DataTypes.STRING(255),
    field: 'Password'
  },
  type: {
    type: DataTypes.ENUM('Staff', 'Admin'),
    allowNull: false,
    field: 'Type'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'Is Active'
  },
  idGoogle: {
    type: DataTypes.STRING(255),
    field: 'Id Google'
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
  tableName: 'Staff',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Staff;
