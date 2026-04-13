// PAYMENT CONTROLLER - Proxy to Spring Boot
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

const getToken = (req) => {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
};

// POST /api/payments/vnpay/create
const createVnpay = async (req, res, next) => {
  try {
    const response = await springApi.post('/payments/vnpay/create', null, {
      params: { orderId: req.body.orderId },
      ...withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    });
    return createdResponse(res, response.data, 'Tạo thanh toán VNPay thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Tạo VNPay thất bại', error.response.status);
    next(error);
  }
};

// GET /api/payments/vnpay/callback (public - Spring Boot callback, không cần auth)
const vnpayCallback = async (req, res, next) => {
  try {
    const response = await springApi.get('/payments/vnpay/callback', { params: req.query });
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// GET /api/payments/vnpay/return (public)
const vnpayReturn = async (req, res, next) => {
  try {
    const response = await springApi.get('/payments/vnpay/callback', { params: req.query });
    return successResponse(res, { success: req.query.vnp_ResponseCode === '00', ...response.data });
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// GET /api/payments/:id/status
const getStatus = async (req, res, next) => {
  try {
    const response = await springApi.get(`/payments/${req.params.id}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// GET /api/payments/order/:orderId
const getByOrder = async (req, res, next) => {
  try {
    const response = await springApi.get(`/payments/order/${req.params.orderId}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// POST /api/payments/cod/confirm
const confirmCod = async (req, res, next) => {
  try {
    const response = await springApi.post('/payments', { ...req.body, method: 'cod', customerId: req.user.ma }, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return createdResponse(res, response.data, 'Xác nhận thanh toán COD thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// === ADMIN ===
const adminGetAll = async (req, res, next) => {
  try { const r = await springApi.get('/payments', withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminGetById = async (req, res, next) => {
  try { const r = await springApi.get(`/payments/${req.params.id}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminRefund = async (req, res, next) => {
  try { const r = await springApi.post(`/payments/${req.params.id}/refund`, {}, withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, r.data, 'Hoàn tiền thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};

module.exports = { createVnpay, vnpayCallback, vnpayReturn, getStatus, getByOrder, confirmCod, adminGetAll, adminGetById, adminRefund };
