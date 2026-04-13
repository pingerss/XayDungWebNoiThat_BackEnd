// ORDER DETAIL CONTROLLER - Proxy to Spring Boot
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, errorResponse } = require('../utils/response');

const getByOrder = async (req, res, next) => {
  try {
    const response = await springApi.get(`/order-details/order/${req.params.orderId}`, withUserHeaders(req.user.ma, req.user.scope));
    return successResponse(res, response.data, 'Lấy chi tiết đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const response = await springApi.get(`/order-details/${req.params.id}`, withUserHeaders(req.user.ma, req.user.scope));
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response?.status === 404) return errorResponse(res, 'Không tìm thấy chi tiết', 404, 'Not Found');
    next(error);
  }
};

const adminGetByOrder = async (req, res, next) => {
  try {
    const response = await springApi.get(`/order-details/order/${req.params.orderId}`);
    return successResponse(res, response.data, 'Lấy chi tiết đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

module.exports = { getByOrder, getById, adminGetByOrder };
