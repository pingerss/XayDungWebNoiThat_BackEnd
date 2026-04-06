const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Staff = sequelize.define('Staff', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name'
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'email'
  },
  password: {
    type: DataTypes.STRING(255),
    field: 'password'
  },
  type: {
    type: DataTypes.ENUM('Staff', 'Admin'),
    allowNull: false,
    field: 'type'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  idGoogle: {
    type: DataTypes.STRING(255),
    field: 'id_google'
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
  tableName: 'staff',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Staff;
