// ORDER DETAIL CONTROLLER - Proxy to Spring Boot (theo spec noi_that_api1.json)
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, errorResponse } = require('../utils/response');

const getToken = (req) => {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
};

// ============================================================
// GET /api/order-details/order/:orderId - Lấy chi tiết theo orderId - ALL ROLES
// Spring Boot: GET /order-details/order/{orderId}
// ============================================================
const getByOrder = async (req, res, next) => {
  try {
    const response = await springApi.get(
      `/order-details/order/${req.params.orderId}`,
      withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    );
    return successResponse(res, response.data, 'Lấy chi tiết đơn hàng thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response?.status === 404) return errorResponse(res, 'Không tìm thấy đơn hàng', 404, 'Not Found');
    next(error);
  }
};

// ============================================================
// GET /api/order-details/:id - Lấy chi tiết theo id - ALL ROLES
// Spring Boot: GET /order-details/{id}
// ============================================================
const getById = async (req, res, next) => {
  try {
    const response = await springApi.get(
      `/order-details/${req.params.id}`,
      withUserHeaders(req.user.ma, req.user.scope, getToken(req))
    );
    return successResponse(res, response.data);
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response?.status === 404) return errorResponse(res, 'Không tìm thấy chi tiết đơn hàng', 404, 'Not Found');
    next(error);
  }
};

module.exports = {
  getByOrder,  // GET /api/order-details/order/:orderId - All roles
  getById      // GET /api/order-details/:id             - All roles
};
