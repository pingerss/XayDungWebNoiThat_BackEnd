// CUSTOMER CONTROLLER - Proxy to Spring Boot
// Node.js BFF chỉ forward request tới Spring Boot Internal API
// JWT được tạo/verify ở Node.js, nhưng data Customer nằm ở Spring Boot

const jwt = require('jsonwebtoken');
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const { ROLES } = require('../config/constants');

// POST /api/customers/register
const register = async (req, res, next) => {
  try {
    const response = await springApi.post('/customers/register', req.body);
    return createdResponse(res, response.data, 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Đăng ký thất bại', error.response.status);
    next(error);
  }
};

// POST /api/customers/login
const login = async (req, res, next) => {
  try {
    const response = await springApi.post('/customers/verify', req.body);
    const customer = response.data;

    // Node.js tạo JWT token
    const token = jwt.sign(
      { sub: customer.email, maKH: customer.id, scope: ROLES.CUSTOMER },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return successResponse(res, { token, customer }, 'Đăng nhập thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401, 'Unauthorized');
    next(error);
  }
};

// POST /api/customers/logout
const logout = async (req, res, next) => {
  try {
    return successResponse(res, null, 'Đăng xuất thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/customers/profile
const getProfile = async (req, res, next) => {
  try {
    const response = await springApi.get(`/customers/${req.user.maKH}`, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, response.data, 'Lấy profile thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, 'Không tìm thấy tài khoản', error.response.status);
    next(error);
  }
};

// PUT /api/customers/profile
const updateProfile = async (req, res, next) => {
  try {
    const response = await springApi.put(`/customers/${req.user.maKH}`, req.body, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, response.data, 'Cập nhật profile thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Cập nhật thất bại', error.response.status);
    next(error);
  }
};

// PUT /api/customers/change-password
const changePassword = async (req, res, next) => {
  try {
    await springApi.put(`/customers/${req.user.maKH}/password`, req.body, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Đổi mật khẩu thất bại', error.response.status);
    next(error);
  }
};

// POST /api/customers/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    // Tìm customer qua Spring Boot
    const response = await springApi.get(`/customers/email/${req.body.email}`);
    if (response.data) {
      const resetToken = jwt.sign({ id: response.data.id, email: response.data.email }, process.env.JWT_SECRET, { expiresIn: '15m' });
      // TODO: Gửi email reset password
    }
    return successResponse(res, null, 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.');
  } catch (error) {
    // Luôn trả success để không leak info
    return successResponse(res, null, 'Nếu email tồn tại, chúng tôi đã gửi link đặt lại mật khẩu.');
  }
};

// POST /api/customers/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await springApi.put(`/customers/${decoded.id}/password`, { newPassword });
    return successResponse(res, null, 'Đặt lại mật khẩu thành công');
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token không hợp lệ hoặc đã hết hạn', 400, 'Bad Request');
    }
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// POST /api/customers/google
const googleLogin = async (req, res, next) => {
  try {
    const response = await springApi.post('/customers/google', req.body);
    const customer = response.data;

    const token = jwt.sign(
      { sub: customer.email, maKH: customer.id, scope: ROLES.CUSTOMER },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return successResponse(res, { token, customer }, 'Đăng nhập Google thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// GET /api/customers/verify-email/:token
const verifyEmail = async (req, res, next) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    await springApi.put(`/customers/${decoded.id}/status`, { isActive: true });
    return successResponse(res, null, 'Xác thực email thành công');
  } catch (error) {
    return errorResponse(res, 'Token không hợp lệ hoặc đã hết hạn', 400, 'Bad Request');
  }
};

// DELETE /api/customers/deactivate
const deactivate = async (req, res, next) => {
  try {
    await springApi.put(`/customers/${req.user.maKH}/status`, { isActive: false }, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, null, 'Vô hiệu hóa tài khoản thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile, changePassword, forgotPassword, resetPassword, googleLogin, verifyEmail, deactivate };
