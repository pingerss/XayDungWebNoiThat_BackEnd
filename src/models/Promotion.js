const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  code: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'Code'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Name'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'Description'
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    field: 'Type'
  },
  value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'Value'
  },
  startDay: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'Start Day'
  },
  endDay: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'End Day'
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
  tableName: 'Promotion',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Promotion;
