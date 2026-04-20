// CATEGORY PROMOTION CONTROLLER - Proxy to Spring Boot
const { springApi } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

// GET /api/category-promotions/category/:categoryId
const getByCategory = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    const response = await springApi.get(`/category-promotions/category/${req.params.categoryId}`, { headers: { ...(token && { Authorization: token }) } });
    return successResponse(res, response.data, 'Lấy khuyến mãi theo category thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Lỗi lấy dữ liệu', error.response.status);
    next(error);
  }
};

// GET /api/category-promotions/promotion/:promotionId
const getByPromotion = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    const response = await springApi.get(`/category-promotions/promotion/${req.params.promotionId}`, { headers: { ...(token && { Authorization: token }) } });
    return successResponse(res, response.data, 'Lấy category theo khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Lỗi lấy dữ liệu', error.response.status);
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    const response = await springApi.post('/category-promotions', req.body, { headers: { ...(token && { Authorization: token }) } });
    return createdResponse(res, response.data, 'Gán khuyến mãi cho category thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Tạo thất bại', error.response.status);
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    await springApi.delete(`/category-promotions/${req.params.id}`, {
      headers: { ...(token && { Authorization: token }) }
    });
    return successResponse(res, null, 'Xóa gán thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Xóa thất bại', error.response.status);
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    const response = await springApi.get('/category-promotions', {
      headers: { ...(token && { Authorization: token }) }
    });
    return successResponse(res, response.data, 'Lấy danh sách tất cả gán thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Lỗi lấy dữ liệu', error.response.status);
    next(error);
  }
};

module.exports = { getByCategory, getByPromotion, create, remove, getAll };
