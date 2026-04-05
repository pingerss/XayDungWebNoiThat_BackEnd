const { sequelize } = require('../config/database');

const Customer = require('./Customer');
const Category = require('./Category');
const Color = require('./Color');
const Dimensions = require('./Dimensions');
const Product = require('./Product');
const ProductAttribute = require('./ProductAttribute');
const ProductImage = require('./ProductImage');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Promotion = require('./Promotion');
const CategoryPromotion = require('./CategoryPromotion');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');
const Payment = require('./Payment');
const Staff = require('./Staff');

// Define Relationships

// Product - Category
Category.hasMany(Product, { foreignKey: 'categoryId' });
Product.belongsTo(Category, { foreignKey: 'categoryId' });

// Product - ProductAttribute
Product.hasMany(ProductAttribute, { foreignKey: 'productId' });
ProductAttribute.belongsTo(Product, { foreignKey: 'productId' });

// Color - ProductAttribute
Color.hasMany(ProductAttribute, { foreignKey: 'colorId' });
ProductAttribute.belongsTo(Color, { foreignKey: 'colorId' });

// Dimensions - ProductAttribute
Dimensions.hasMany(ProductAttribute, { foreignKey: 'dimensionsId' });
ProductAttribute.belongsTo(Dimensions, { foreignKey: 'dimensionsId' });

// Product - ProductImage
Product.hasMany(ProductImage, { foreignKey: 'productId' });
ProductImage.belongsTo(Product, { foreignKey: 'productId' });

// ProductAttribute - ProductImage
ProductAttribute.hasMany(ProductImage, { foreignKey: 'productAttributeId' });
ProductImage.belongsTo(ProductAttribute, { foreignKey: 'productAttributeId' });

// Customer - Cart
Customer.hasMany(Cart, { foreignKey: 'customerId' });
Cart.belongsTo(Customer, { foreignKey: 'customerId' });

// Cart - CartItem
Cart.hasMany(CartItem, { foreignKey: 'cartId' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId' });

// Product - CartItem
Product.hasMany(CartItem, { foreignKey: 'productId' });
CartItem.belongsTo(Product, { foreignKey: 'productId' });

// ProductAttribute - CartItem
ProductAttribute.hasMany(CartItem, { foreignKey: 'productAttributeId' });
CartItem.belongsTo(ProductAttribute, { foreignKey: 'productAttributeId' });

// Customer - Order
Customer.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(Customer, { foreignKey: 'customerId' });

// Promotion - Order
Promotion.hasMany(Order, { foreignKey: 'promotionId' });
Order.belongsTo(Promotion, { foreignKey: 'promotionId' });

// Order - OrderDetail
Order.hasMany(OrderDetail, { foreignKey: 'orderId' });
OrderDetail.belongsTo(Order, { foreignKey: 'orderId' });

// ProductAttribute - OrderDetail
ProductAttribute.hasMany(OrderDetail, { foreignKey: 'productAttributeId' });
OrderDetail.belongsTo(ProductAttribute, { foreignKey: 'productAttributeId' });

// Order - Payment
Order.hasMany(Payment, { foreignKey: 'orderId' });
Payment.belongsTo(Order, { foreignKey: 'orderId' });

// Category - CategoryPromotion
Category.hasMany(CategoryPromotion, { foreignKey: 'categoryId' });
CategoryPromotion.belongsTo(Category, { foreignKey: 'categoryId' });

// Promotion - CategoryPromotion
Promotion.hasMany(CategoryPromotion, { foreignKey: 'promotionId' });
CategoryPromotion.belongsTo(Promotion, { foreignKey: 'promotionId' });

module.exports = {
  sequelize,
  Customer,
  Category,
  Color,
  Dimensions,
  Product,
  ProductAttribute,
  ProductImage,
  Cart,
  CartItem,
  Promotion,
  CategoryPromotion,
  Order,
  OrderDetail,
  Payment,
  Staff
};
