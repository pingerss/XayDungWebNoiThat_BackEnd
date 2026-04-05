const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ProductAttribute = sequelize.define('ProductAttribute', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    field: 'Id'
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Product Id'
  },
  colorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Color Id'
  },
  dimensionsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'Dimensions Id'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'Name'
  },
  price: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'Price'
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'Stock'
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
  tableName: 'Product Attributes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = ProductAttribute;
