const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Dimensions = sequelize.define('Dimensions', {
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
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'dimensions',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Dimensions;
