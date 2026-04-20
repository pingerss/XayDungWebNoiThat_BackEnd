// ORDER CONTROLLER - Proxy to Spring Boot (theo spec noi_that_api1.json)
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { Cart, CartItem, ProductAttribute, Product, ProductImage } = require('../models');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

const getToken = (req) => {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
};

// ============================================================
// POST /api/orders - Tạo đơn hàng - CHỈ CUSTOMER
// Spring Boot body: { customerId, promotionId, customerName, customerPhone,
//   customerAddress, method, subtotal, discountAmount, totalPrice, note,
//   items: [{ productAttributeId, productName, productImage, quantity, unitPrice, total }] }
// ============================================================
const create = async (req, res, next) => {
  try {
    const { customerName, customerPhone, customerAddress, method, promotionId, discountAmount, note } = req.body;
    const customerId = req.user.ma;

    // Lấy giỏ hàng
    const cart = await Cart.findOne({ where: { customerId } });
    if (!cart) return errorResponse(res, 'Giỏ hàng trống', 400, 'Bad Request');

    const cartItems = await CartItem.findAll({
      where: { cartId: cart.id },
      include: [
        { model: Product, attributes: ['id', 'name'] },
        {
          model: ProductAttribute,
          include: [{ model: ProductImage, where: { isMain: true }, required: false }]
        }
      ]
    });

    if (cartItems.length === 0) return errorResponse(res, 'Giỏ hàng trống', 400, 'Bad Request');

    // Tính tiền
    const subtotal = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const discount = parseFloat(discountAmount) || 0;
    const totalPrice = subtotal - discount;

    // Map items đúng theo Spring Boot spec
    const items = cartItems.map(item => ({
      productAttributeId: item.productAttributeId,
      productName:        item.Product?.name || 'N/A',
      productImage:       item.ProductAttribute?.ProductImages?.[0]?.imageUrl || null,
      quantity:           item.quantity,
      unitPrice:          parseFloat(item.price),
      total:              parseFloat(item.price) * item.quantity
    }));

    const orderData = {
      customerId,
      promotionId:      promotionId || null,
      customerName,
      customerPhone,
      customerAddress,
      method:           (method || 'cod').toLowerCase(), // Spring Boot enum: 'cod' | 'vnpay' (lowercase)
      subtotal,
      discountAmount:   discount,
      totalPrice,
      note:             note || null,
      items
    };

    const response = await springApi.post('/orders', orderData, withUserHeaders(customerId, req.user.scope, getToken(req)));

    // Ktra Spring Boot trả về lỗi trong body (HTTP 2xx nhưng payload chứa error)
    if (response.data?.code && response.data.code >= 400) {
      return errorResponse(res, response.data.message || 'Tạo đơn hàng thất bại', response.data.code);
    }

    // Chỉ trừ kho & xóa giỏ hàng khi Spring Boot xác nhận thành công
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

// ============================================================
// GET /api/orders - Lấy TẤT CẢ đơn hàng - ALL ROLES
// Spring Boot: GET /orders
// ============================================================
const getAll = async (req, res, next) => {
  try {
    const response = await springApi.get('/orders', withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, response.data, 'Lấy danh sách đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// ============================================================
// GET /api/orders/customer/:customerId - Lấy đơn theo customer - ALL ROLES
// Spring Boot: GET /orders/customer/{customerId}
// ============================================================
const getByCustomerId = async (req, res, next) => {
  try {
    const customerId = req.params.customerId;
    const response = await springApi.get(`/orders/customer/${customerId}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, response.data, 'Lấy danh sách đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// ============================================================
// GET /api/orders/:id - Lấy đơn hàng theo ID - ALL ROLES
// Spring Boot: GET /orders/{id}
// ============================================================
const getById = async (req, res, next) => {
  try {
    const response = await springApi.get(`/orders/${req.params.id}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response?.status === 404) return errorResponse(res, 'Không tìm thấy đơn hàng', 404, 'Not Found');
    next(error);
  }
};

// ============================================================
// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng - CHỈ STAFF/ADMIN
// Spring Boot: PUT /orders/{id}/status  body: { status, note }
// ============================================================
const updateStatus = async (req, res, next) => {
  try {
    const response = await springApi.put(
      `/orders/${req.params.id}/status`,
      req.body,  // { status: "CONFIRMED" | "SHIPPING" | "DELIVERED" | ..., note }
      withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    );
    return successResponse(res, response.data, 'Cập nhật trạng thái đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Cập nhật thất bại', error.response.status);
    next(error);
  }
};

// ============================================================
// PUT /api/orders/:id/cancel - Hủy đơn hàng - ALL ROLES (authenticated)
// Spring Boot: PUT /orders/{id}/cancel
// ============================================================
const cancel = async (req, res, next) => {
  try {
    const response = await springApi.put(
      `/orders/${req.params.id}/cancel`,
      {},
      withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    );

    // Hoàn stock nếu Spring Boot trả về orderDetails / items
    const orderData = response.data?.result || response.data;
    const orderItems = orderData?.orderDetails || orderData?.items || [];
    for (const detail of orderItems) {
      if (detail.productAttributeId && detail.quantity) {
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

module.exports = {
  create,           // POST /api/orders                   - Customer only
  getAll,           // GET  /api/orders                   - All roles
  getByCustomerId,  // GET  /api/orders/customer/:id      - All roles
  getById,          // GET  /api/orders/:id               - All roles
  updateStatus,     // PUT  /api/orders/:id/status        - Staff/Admin only
  cancel            // PUT  /api/orders/:id/cancel        - All authenticated
};
