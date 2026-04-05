const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CategoryPromotion = sequelize.define('CategoryPromotion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Category Id'
  },
  promotionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Promotion Id'
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
  tableName: 'Category Promotion',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = CategoryPromotion;
