const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Color = sequelize.define('Color', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Name'
  },
  hexCode: {
    type: DataTypes.STRING(7),
    field: 'Hex Code'
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
  tableName: 'Color',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Color;
