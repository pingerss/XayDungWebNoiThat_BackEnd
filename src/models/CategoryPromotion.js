const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CategoryPromotion = sequelize.define('CategoryPromotion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'category_id'
  },
  promotionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'promotion_id'
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
  tableName: 'category_promotion',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = CategoryPromotion;
