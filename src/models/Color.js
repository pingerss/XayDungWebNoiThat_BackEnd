const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Color = sequelize.define('Color', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name'
  },
  hexCode: {
    type: DataTypes.STRING(7),
    field: 'hex_code'
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
  tableName: 'color',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Color;
