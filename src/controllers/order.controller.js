// ORDER CONTROLLER - Proxy to Spring Boot
// Node.js BFF xử lý: validate cart, tính toán → gọi Spring Boot tạo order
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { Cart, CartItem, ProductAttribute, Product, ProductImage } = require('../models');
const { successResponse, createdResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { parsePagination } = require('../utils/helpers');

// POST /api/orders - Node.js validate cart + gọi Spring Boot tạo order
const create = async (req, res, next) => {
  try {
    const { customerName, customerPhone, customerAddress, method, promotionId, note } = req.body;
    const customerId = req.user.maKH;

    // Node.js lấy cart items từ DB (cart là của Node.js)
    const cart = await Cart.findOne({ where: { customerId } });
    if (!cart) return errorResponse(res, 'Giỏ hàng trống', 400, 'Bad Request');

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        { model: Product, attributes: ['id', 'name'] },
        { model: ProductAttribute, include: [{ model: ProductImage, where: { isMain: true }, required: false }] }
      ]
    });

    if (cartItems.length === 0) return errorResponse(res, 'Giỏ hàng trống', 400, 'Bad Request');

    // Tính subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

    // Chuẩn bị order details
    const orderDetails = cartItems.map(item => ({
      productAttributeId: item.productAttributeId,
      productName: item.Product?.name || 'N/A',
      productImage: item.ProductAttribute?.ProductImages?.[0]?.imageUrl || null,
      quantity: item.quantity,
      unitPrice: item.price,
      total: parseFloat(item.price) * item.quantity
    }));

    // Gọi Spring Boot tạo order
    const orderData = {
      customerId, promotionId, customerName, customerPhone, customerAddress,
      method: method || 'cod', subtotal, note, orderDetails
    };

    const response = await springApi.post('/orders', orderData, withUserHeaders(customerId, req.user.scope));

    // Nếu Spring Boot tạo thành công → Node.js trừ stock + xóa cart
    if (response.data) {
      for (const item of cartItems) {
        await ProductAttribute.decrement('stock', { by: item.quantity, where: { id: item.productAttributeId } });
      }
      await CartItem.destroy({ where: { cartId: cart.id } });
    }

    return createdResponse(res, response.data, 'Tạo đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Tạo đơn hàng thất bại', error.response.status);
    next(error);
  }
};

// GET /api/orders (my orders)
const getMyOrders = async (req, res, next) => {
  try {
    const response = await springApi.get(`/orders/customer/${req.user.maKH}`, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, response.data, 'Lấy danh sách đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// GET /api/orders/:id
const getById = async (req, res, next) => {
  try {
    const response = await springApi.get(`/orders/${req.params.id}`, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response?.status === 404) return errorResponse(res, 'Không tìm thấy đơn hàng', 404, 'Not Found');
    next(error);
  }
};

// GET /api/orders/:id/status
const getStatus = async (req, res, next) => {
  try {
    const response = await springApi.get(`/orders/${req.params.id}/status`, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// PUT /api/orders/:id/cancel
const cancel = async (req, res, next) => {
  try {
    const response = await springApi.put(`/orders/${req.params.id}/cancel`, {}, withUserHeaders(req.user.maKH, req.user.scope));

    // Hoàn stock (Node.js quản lý stock)
    if (response.data?.orderDetails) {
      for (const detail of response.data.orderDetails) {
        await ProductAttribute.increment('stock', { by: detail.quantity, where: { id: detail.productAttributeId } });
      }
    }

    return successResponse(res, response.data, 'Hủy đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Hủy thất bại', error.response.status);
    next(error);
  }
};

// POST /api/orders/:id/confirm
const confirm = async (req, res, next) => {
  try {
    const response = await springApi.put(`/orders/${req.params.id}/status`, { status: 'confirmed' }, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, response.data, 'Xác nhận đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// GET /api/orders/tracking/:trackingNumber
const tracking = async (req, res, next) => {
  try {
    const response = await springApi.get(`/orders/tracking/${req.params.trackingNumber}`);
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    return errorResponse(res, 'Không tìm thấy đơn hàng', 404, 'Not Found');
  }
};

// POST /api/orders/:id/reorder - Node.js tự xử lý (thêm lại vào cart)
const reorder = async (req, res, next) => {
  try {
    const response = await springApi.get(`/orders/${req.params.id}`, withUserHeaders(req.user.maKH, req.user.scope));
    const order = response.data;

    // Thêm items vào cart (Node.js quản lý cart)
    const cart = await Cart.findOne({ where: { customerId: req.user.maKH } })
      || await Cart.create({ customerId: req.user.maKH, sessionId: require('uuid').v4() });

    if (order.orderDetails) {
      for (const detail of order.orderDetails) {
        const attr = await ProductAttribute.findByPk(detail.productAttributeId);
        if (!attr || attr.stock <= 0) continue;

        const existing = await CartItem.findOne({
          where: { cartId: cart.id, productAttributeId: detail.productAttributeId }
        });

        if (existing) {
          existing.quantity = Math.min(existing.quantity + detail.quantity, attr.stock);
          existing.price = attr.price;
          await existing.save();
        } else {
          await CartItem.create({
            cartId: cart.id, productId: attr.productId,
            productAttributeId: detail.productAttributeId,
            quantity: Math.min(detail.quantity, attr.stock), price: attr.price
          });
        }
      }
    }
    return successResponse(res, null, 'Đã thêm các sản phẩm vào giỏ hàng');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// === ADMIN (proxy) ===
const adminGetAll = async (req, res, next) => {
  try { const r = await springApi.get('/orders'); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminGetById = async (req, res, next) => {
  try { const r = await springApi.get(`/orders/${req.params.id}`); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminUpdateStatus = async (req, res, next) => {
  try { const r = await springApi.put(`/orders/${req.params.id}/status`, req.body); return successResponse(res, r.data, 'Cập nhật trạng thái thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminAssignShipper = async (req, res, next) => {
  try { const r = await springApi.put(`/orders/${req.params.id}/status`, { status: 'shipping' }); return successResponse(res, r.data, 'Gán shipper thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminFilter = async (req, res, next) => {
  try { const r = await springApi.get('/orders', { params: req.query }); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminStatistics = async (req, res, next) => {
  try { const r = await springApi.get('/orders/statistics'); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};

module.exports = { create, getMyOrders, getById, getStatus, cancel, confirm, tracking, reorder, adminGetAll, adminGetById, adminUpdateStatus, adminAssignShipper, adminFilter, adminStatistics };
