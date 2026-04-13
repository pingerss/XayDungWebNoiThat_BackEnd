// CUSTOMER CONTROLLER - Proxy to Spring Boot
const jwt = require('jsonwebtoken');
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const { ROLES } = require('../config/constants');

// Lấy raw JWT token từ Authorization header
const getToken = (req) => {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
};

// POST /api/customers/register
const register = async (req, res, next) => {
  try {
    const response = await springApi.post('/customers/register', req.body);
    const data = response.data;

    const errorCode = data?.code ?? data?.data?.code;
    if (errorCode && errorCode !== 200 && errorCode !== 201) {
      const errorMessage = data?.message ?? data?.data?.message ?? 'Đăng ký thất bại';
      return errorResponse(res, errorMessage, 400, 'Bad Request');
    }

    return createdResponse(res, data, 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực.');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Đăng ký thất bại', error.response.status);
    next(error);
  }
};

// POST /api/customers/login - ĐÃ DEPRECATED, dùng POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const response = await springApi.post('/auth/login', req.body);
    const customer = response.data.result || response.data;

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
  return successResponse(res, null, 'Đăng xuất thành công');
};

// GET /api/customers/profile
const getProfile = async (req, res, next) => {
  try {
    const response = await springApi.get(`/customers/${req.user.maKH}`, withUserHeaders(req.user.maKH, req.user.scope, getToken(req)));
    const profileData = response.data.result || response.data;
    return successResponse(res, profileData, 'Lấy profile thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Lỗi từ máy chủ Spring', error.response.status);
    next(error);
  }
};

// PUT /api/customers/profile
const updateProfile = async (req, res, next) => {
  try {
    const response = await springApi.put(`/customers/${req.user.maKH}`, req.body, withUserHeaders(req.user.maKH, req.user.scope, getToken(req)));
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
    await springApi.put(`/customers/${req.user.maKH}/change-password`, req.body, withUserHeaders(req.user.maKH, req.user.scope, getToken(req)));
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
    const response = await springApi.post('/auth/forgot-password', { email: req.body.email });
    console.log('[ForgotPassword] Spring Boot response:', JSON.stringify(response.data));
    return successResponse(res, null, 'Nếu email tồn tại, mã OTP đã được gửi đến thiết bị của bạn.');
  } catch (error) {
    if (error.response) {
      console.error('[ForgotPassword] ❌ Spring Boot error:', error.response.status, JSON.stringify(error.response.data));
    } else if (error.statusCode === 503) {
      console.error('[ForgotPassword] ❌ Spring Boot không khả dụng (503)');
    } else {
      console.error('[ForgotPassword] ❌ Unknown error:', error.message);
    }
    return successResponse(res, null, 'Nếu email tồn tại, mã OTP đã được gửi đến thiết bị của bạn.');
  }
};

// POST /api/customers/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    await springApi.post('/auth/verify-otp', { email: req.body.email, otp: req.body.otp });
    return successResponse(res, null, 'OTP hợp lệ');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    return errorResponse(res, 'Mã OTP không hợp lệ hoặc đã hết hạn', 400, 'Bad Request');
  }
};

// POST /api/customers/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    await springApi.post('/auth/reset-password', { email, otp, newPassword });
    return successResponse(res, null, 'Đặt lại mật khẩu thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

// POST /api/customers/google
const googleLogin = async (req, res, next) => {
  try {
    const response = await springApi.post('/customers/google', req.body);
    const data = response.data;

    const errorCode = data?.code ?? data?.data?.code;
    if (errorCode && errorCode !== 200 && errorCode !== 201) {
      const errorMessage = data?.message ?? data?.data?.message ?? 'Đăng nhập Google thất bại';
      return errorResponse(res, errorMessage, 400, 'Bad Request');
    }

    const customer = data?.result ?? data;

    const token = jwt.sign(
      { sub: customer.email, maKH: customer.id, scope: ROLES.CUSTOMER },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return successResponse(res, { token, customer }, 'Đăng nhập Google thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Đăng nhập Google thất bại', error.response.status);
    next(error);
  }
};

// DELETE /api/customers/deactivate
const deactivate = async (req, res, next) => {
  try {
    await springApi.put(`/customers/${req.user.maKH}/deactivate`, {}, withUserHeaders(req.user.maKH, req.user.scope, getToken(req)));
    return successResponse(res, null, 'Vô hiệu hóa tài khoản thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword, googleLogin, deactivate };
