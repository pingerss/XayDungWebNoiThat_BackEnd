const { Cart, CartItem, Product, ProductAttribute, ProductImage, Color, Dimensions } = require('../models');
const { springApi } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const { generateSessionId } = require('../utils/helpers');

// Helper: Get or create cart for user
const getOrCreateCart = async (customerId) => {
  let cart = await Cart.findOne({ where: { customerId } });
  if (!cart) {
    cart = await Cart.create({ customerId, sessionId: generateSessionId() });
  }
  return cart;
};

// GET /api/cart
const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);

    const cartWithItems = await Cart.findByPk(cart.id, {
      include: [{
        model: CartItem,
        include: [
          {
            model: Product,
            attributes: ['id', 'name'],
            include: [
              {
                model: ProductImage,
                where: { isMain: true },
                required: false,
                attributes: ['id', 'imageUrl'],
                limit: 1
              }
            ]
          },
          {
            model: ProductAttribute,
            include: [
              { model: Color, attributes: ['id', 'name', 'hexCode'] },
              { model: Dimensions, attributes: ['id', 'name'] }
            ]
          }
        ]
      }]
    });

    return successResponse(res, cartWithItems, 'Lấy giỏ hàng thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/cart/items/count
const getItemCount = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);
    const count = await CartItem.sum('quantity', { where: { cartId: cart.id } });
    return successResponse(res, { count: count || 0 }, 'Lấy số lượng items thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/cart/total
const getTotal = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);
    const items = await CartItem.findAll({ where: { cartId: cart.id } });

    const total = items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);

    return successResponse(res, { total }, 'Lấy tổng tiền giỏ hàng thành công');
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/add
const addItem = async (req, res, next) => {
  try {
    const { productId, productAttributeId, quantity } = req.body;

    if (!productId || !productAttributeId || !quantity) {
      return errorResponse(res, 'productId, productAttributeId, quantity là bắt buộc', 400, 'Bad Request');
    }

    // Check product attribute exists and has stock
    const attr = await ProductAttribute.findByPk(productAttributeId);
    if (!attr) return errorResponse(res, 'Product attribute không tồn tại', 404, 'Not Found');
    if (attr.stock < quantity) {
      return errorResponse(res, `Không đủ số lượng trong kho. Còn lại: ${attr.stock}`, 422, 'Unprocessable Entity');
    }

    const cart = await getOrCreateCart(req.user.ma);

    // Check if item already in cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId, productAttributeId }
    });

    if (cartItem) {
      const newQty = cartItem.quantity + parseInt(quantity);
      if (attr.stock < newQty) {
        return errorResponse(res, `Không đủ số lượng. Còn lại: ${attr.stock}`, 422, 'Unprocessable Entity');
      }
      cartItem.quantity = newQty;
      cartItem.price = attr.price;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        productAttributeId,
        quantity: parseInt(quantity),
        price: attr.price
      });
    }

    return createdResponse(res, cartItem, 'Thêm sản phẩm vào giỏ thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/update/:itemId
const updateItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user.ma);

    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id }
    });

    if (!item) return errorResponse(res, 'Không tìm thấy item trong giỏ', 404, 'Not Found');

    const attr = await ProductAttribute.findByPk(item.productAttributeId);
    if (attr.stock < quantity) {
      return errorResponse(res, `Không đủ số lượng. Còn lại: ${attr.stock}`, 422, 'Unprocessable Entity');
    }

    item.quantity = parseInt(quantity);
    await item.save();

    return successResponse(res, item, 'Cập nhật số lượng thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/remove/:itemId
const removeItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);
    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id }
    });

    if (!item) return errorResponse(res, 'Không tìm thấy item trong giỏ', 404, 'Not Found');

    await item.destroy();
    return successResponse(res, null, 'Xóa item khỏi giỏ thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/clear
const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);
    await CartItem.destroy({ where: { cartId: cart.id } });
    return successResponse(res, null, 'Xóa toàn bộ giỏ hàng thành công');
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/apply-promotion
const applyPromotion = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) return errorResponse(res, 'Mã giảm giá là bắt buộc', 400, 'Bad Request');

    // Gọi Spring Boot để validate promotion
    let promotion;
    try {
      const response = await springApi.get(`/promotions/validate/${code}`);
      promotion = response.data;
    } catch (err) {
      if (err.statusCode === 503) return errorResponse(res, err.message, 503, 'Service Unavailable');
      return errorResponse(res, 'Mã giảm giá không hợp lệ hoặc đã hết hạn', 400, 'Bad Request');
    }

    // Calculate discount (Node.js tính toán vì Cart là của Node.js)
    const cart = await getOrCreateCart(req.user.ma);
    const items = await CartItem.findAll({ where: { cartId: cart.id } });
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = subtotal * (parseFloat(promotion.value) / 100);
    } else {
      discount = parseFloat(promotion.value);
    }

    return successResponse(res, {
      code: promotion.code,
      type: promotion.type,
      value: promotion.value,
      discount,
      subtotal,
      total: subtotal - discount
    }, 'Áp dụng mã giảm giá thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/remove-promotion
const removePromotion = async (req, res, next) => {
  try {
    return successResponse(res, null, 'Xóa mã giảm giá thành công');
  } catch (error) {
    next(error);
  }
};

// POST /api/cart/sync
const syncCart = async (req, res, next) => {
  try {
    const { items } = req.body; // Array of { productId, productAttributeId, quantity }
    const cart = await getOrCreateCart(req.user.ma);

    if (items && items.length > 0) {
      for (const item of items) {
        const attr = await ProductAttribute.findByPk(item.productAttributeId);
        if (!attr) continue;

        let existing = await CartItem.findOne({
          where: { cartId: cart.id, productId: item.productId, productAttributeId: item.productAttributeId }
        });

        if (existing) {
          existing.quantity = Math.min(existing.quantity + item.quantity, attr.stock);
          existing.price = attr.price;
          await existing.save();
        } else {
          await CartItem.create({
            cartId: cart.id,
            productId: item.productId,
            productAttributeId: item.productAttributeId,
            quantity: Math.min(item.quantity, attr.stock),
            price: attr.price
          });
        }
      }
    }

    return successResponse(res, null, 'Đồng bộ giỏ hàng thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/cart/checkout-info
const getCheckoutInfo = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        { model: Product, attributes: ['id', 'name'] },
        {
          model: ProductAttribute,
          include: [
            { model: Color, attributes: ['id', 'name'] },
            { model: Dimensions, attributes: ['id', 'name'] },
            { model: ProductImage, where: { isMain: true }, required: false, attributes: ['imageUrl'] }
          ]
        }
      ]
    });

    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    return successResponse(res, { items, subtotal, itemCount: items.length }, 'Lấy thông tin checkout thành công');
  } catch (error) {
    next(error);
  }
};

// === Cart Item endpoints ===

// GET /api/cart/items
const getAllItems = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);
    const items = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        {
          model: Product,
          attributes: ['id', 'name'],
          include: [
            {
              model: ProductImage,
              where: { isMain: true },
              required: false,
              attributes: ['id', 'imageUrl'],
              limit: 1
            }
          ]
        },
        { model: ProductAttribute, attributes: ['id', 'name', 'price', 'stock'] }
      ]
    });
    return successResponse(res, items, 'Lấy tất cả items thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/cart/items/:itemId
const getItemById = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);
    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id },
      include: [
        { model: Product },
        { model: ProductAttribute }
      ]
    });

    if (!item) return errorResponse(res, 'Không tìm thấy item', 404, 'Not Found');
    return successResponse(res, item);
  } catch (error) {
    next(error);
  }
};

// PUT /api/cart/items/:itemId/quantity
const updateItemQuantity = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await getOrCreateCart(req.user.ma);

    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id }
    });

    if (!item) return errorResponse(res, 'Không tìm thấy item', 404, 'Not Found');

    const attr = await ProductAttribute.findByPk(item.productAttributeId);
    if (attr.stock < quantity) {
      return errorResponse(res, `Không đủ số lượng. Còn lại: ${attr.stock}`, 422, 'Unprocessable Entity');
    }

    item.quantity = parseInt(quantity);
    await item.save();

    return successResponse(res, item, 'Cập nhật số lượng thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/cart/items/:itemId
const deleteItem = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user.ma);
    const item = await CartItem.findOne({
      where: { id: req.params.itemId, cartId: cart.id }
    });

    if (!item) return errorResponse(res, 'Không tìm thấy item', 404, 'Not Found');

    await item.destroy();
    return successResponse(res, null, 'Xóa item thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  getItemCount,
  getTotal,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyPromotion,
  removePromotion,
  syncCart,
  getCheckoutInfo,
  getAllItems,
  getItemById,
  updateItemQuantity,
  deleteItem
};
