// PAYMENT CONTROLLER - Proxy to Spring Boot
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

const getToken = (req) => {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
};

// ============================================================
// ẢNH 1: POST /api/payments
// Tạo thanh toán (VNPay hoặc COD) - ALL ROLES
// Body: { orderId, method: "vnpay"|"cod", amount }
// ============================================================
const createPayment = async (req, res, next) => {
  try {
    const response = await springApi.post(
      '/payments',
      req.body,
      withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    );
    return createdResponse(res, response.data, 'Tạo payment thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Tạo payment thất bại', error.response.status);
    next(error);
  }
};

// ============================================================
// ẢNH 2: POST /api/payments/vnpay/create?orderId=...
// Tạo link thanh toán VNPay - CHỈ CUSTOMER
// Lưu ý: Phải tạo payment (ảnh 1) trước, sau đó mới gọi endpoint này
// ============================================================
const createVnpay = async (req, res, next) => {
  try {
    const orderId = req.query.orderId || req.body.orderId;
    if (!orderId) return errorResponse(res, 'orderId là bắt buộc', 400, 'Bad Request');

    const response = await springApi.post('/payments/vnpay/create', null, {
      params: { orderId },
      ...withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    });
    return successResponse(res, response.data, 'Tạo thanh toán VNPay thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Tạo VNPay thất bại', error.response.status);
    next(error);
  }
};


// ============================================================
// ẢNH 4: GET /api/payments/:id
// Lấy thông tin thanh toán theo ID - ALL ROLES
// ============================================================
const getById = async (req, res, next) => {
  try {
    const response = await springApi.get(
      `/payments/${req.params.id}`,
      withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    );
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Không tìm thấy payment', error.response.status);
    next(error);
  }
};

// ============================================================
// ẢNH 5: GET /api/payments/order/:orderId
// Lấy thông tin thanh toán theo orderId - ALL ROLES
// ============================================================
const getByOrder = async (req, res, next) => {
  try {
    const response = await springApi.get(
      `/payments/order/${req.params.orderId}`,
      withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    );
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Không tìm thấy payment', error.response.status);
    next(error);
  }
};

// ============================================================
// ADMIN ONLY - Dùng trong admin.routes.js
// ============================================================

// GET /admin/payments - Lấy tất cả payment
const adminGetAll = async (req, res, next) => {
  try {
    const r = await springApi.get('/payments', withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, r.data);
  } catch (e) {
    if (e.statusCode === 503) return errorResponse(res, e.message, 503, 'Service Unavailable');
    next(e);
  }
};

// PUT /admin/payments/:id/status?status=success - Cập nhật trạng thái payment - ADMIN ONLY
// Dùng để cập nhật đơn COD khi giao hàng thành công (VNPay tự động cập nhật qua callback)
// Query param: ?status=success | pending | failed
const adminUpdateStatus = async (req, res, next) => {
  try {
    const status = req.query.status;
    if (!status) return errorResponse(res, 'Query param "status" là bắt buộc (e.g. ?status=success)', 400, 'Bad Request');

    const r = await springApi.put(
      `/payments/${req.params.id}/status`,
      null,
      {
        params: { status },
        ...withUserHeaders(req.user.ma, req.user.scope, getToken(req))
      }
    );
    return successResponse(res, r.data, 'Cập nhật trạng thái thành công');
  } catch (e) {
    if (e.statusCode === 503) return errorResponse(res, e.message, 503, 'Service Unavailable');
    if (e.response) return errorResponse(res, e.response.data?.message || 'Cập nhật thất bại', e.response.status);
    next(e);
  }
};


module.exports = {
  // Main routes (all roles / customer only)
  createPayment,   // POST /api/payments           - All roles
  createVnpay,     // POST /api/payments/vnpay/create?orderId=... - Customer only
  getById,         // GET  /api/payments/:id        - All roles
  getByOrder,      // GET  /api/payments/order/:oid - All roles
  // Admin routes (Admin/Staff only)
  adminGetAll,         // GET /admin/payments
  adminUpdateStatus    // PUT /admin/payments/:id/status?status=success (COD only)
};
