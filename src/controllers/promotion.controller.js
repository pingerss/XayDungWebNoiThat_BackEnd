// PROMOTION CONTROLLER - Proxy to Spring Boot
const { springApi } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

// GET /api/promotions
const getActive = async (req, res, next) => {
  try {
    const response = await springApi.get('/promotions/active');
    return successResponse(res, response.data, 'Lấy danh sách khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// GET /api/promotions/:id
const getById = async (req, res, next) => {
  try {
    const response = await springApi.get(`/promotions/${req.params.id}`);
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response?.status === 404) return errorResponse(res, 'Không tìm thấy khuyến mãi', 404, 'Not Found');
    next(error);
  }
};

// GET /api/promotions/validate/:code
const validate = async (req, res, next) => {
  try {
    const response = await springApi.get(`/promotions/validate/${req.params.code}`);
    return successResponse(res, response.data, 'Mã giảm giá hợp lệ');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    return errorResponse(res, 'Mã giảm giá không hợp lệ hoặc đã hết hạn', 400, 'Bad Request');
  }
};

// GET /api/promotions/code/:code
const getByCode = async (req, res, next) => {
  try {
    const response = await springApi.get(`/promotions/validate/${req.params.code}`);
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    return errorResponse(res, 'Không tìm thấy khuyến mãi', 404, 'Not Found');
  }
};

// GET /api/promotions/for-product/:productId
const getForProduct = async (req, res, next) => {
  try {
    // Lấy product từ DB Node.js để biết categoryId
    const { Product } = require('../models');
    const product = await Product.findByPk(req.params.productId);
    if (!product) return errorResponse(res, 'Sản phẩm không tồn tại', 404, 'Not Found');

    // Gọi Spring Boot lấy promotions theo category
    const response = await springApi.get(`/category-promotions/category/${product.categoryId}`);
    return successResponse(res, response.data, 'Lấy khuyến mãi cho sản phẩm thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// === ADMIN (proxy to Spring Boot) ===

const create = async (req, res, next) => {
  try {
    const response = await springApi.post('/promotions', req.body);
    return createdResponse(res, response.data, 'Tạo khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Tạo thất bại', error.response.status);
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const response = await springApi.put(`/promotions/${req.params.id}`, req.body);
    return successResponse(res, response.data, 'Cập nhật khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Cập nhật thất bại', error.response.status);
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await springApi.delete(`/promotions/${req.params.id}`);
    return successResponse(res, null, 'Xóa khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const activate = async (req, res, next) => {
  try {
    const response = await springApi.put(`/promotions/${req.params.id}`, { isActive: true });
    return successResponse(res, response.data, 'Kích hoạt khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const deactivate = async (req, res, next) => {
  try {
    const response = await springApi.put(`/promotions/${req.params.id}`, { isActive: false });
    return successResponse(res, response.data, 'Vô hiệu hóa khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const response = await springApi.get('/promotions/active');
    return successResponse(res, response.data, 'Lấy tất cả khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

module.exports = { getActive, getById, validate, getByCode, getForProduct, create, update, remove, activate, deactivate, getAll };
