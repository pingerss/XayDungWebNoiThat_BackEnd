const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductAttribute = sequelize.define('ProductAttribute', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'product_id'
  },
  colorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'color_id'
  },
  dimensionsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'dimensions_id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'name'
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'price'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'stock'
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
  tableName: 'product_attributes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = ProductAttribute;
