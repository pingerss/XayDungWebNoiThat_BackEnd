// CATEGORY PROMOTION CONTROLLER - Proxy to Spring Boot
const { springApi } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

// GET /api/category-promotions/category/:categoryId
const getByCategory = async (req, res, next) => {
  try {
    const response = await springApi.get(`/category-promotions/category/${req.params.categoryId}`);
    return successResponse(res, response.data, 'Lấy khuyến mãi theo category thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// GET /api/category-promotions/promotion/:promotionId
const getByPromotion = async (req, res, next) => {
  try {
    const response = await springApi.get(`/category-promotions/promotion/${req.params.promotionId}`);
    return successResponse(res, response.data, 'Lấy category theo khuyến mãi thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const response = await springApi.post('/category-promotions', req.body);
    return createdResponse(res, response.data, 'Gán khuyến mãi cho category thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Tạo thất bại', error.response.status);
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    await springApi.delete(`/category-promotions/${req.params.id}`);
    return successResponse(res, null, 'Xóa gán thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const getAll = async (req, res, next) => {
  try {
    const response = await springApi.get('/category-promotions');
    return successResponse(res, response.data, 'Lấy danh sách tất cả gán thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

module.exports = { getByCategory, getByPromotion, create, remove, getAll };
