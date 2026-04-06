const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Promotion = sequelize.define('Promotion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  code: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'code'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name'
  },
  description: {
    type: DataTypes.TEXT,
    field: 'description'
  },
  type: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    allowNull: false,
    field: 'type'
  },
  value: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'value'
  },
  startDay: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_day'
  },
  endDay: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_day'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
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
  tableName: 'promotion',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Promotion;
