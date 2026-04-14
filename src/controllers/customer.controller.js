// CUSTOMER CONTROLLER - Proxy to Spring Boot
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const { ROLES } = require('../config/constants');

// Google OAuth2 client để xác thực ID Token từ frontend
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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

// POST /api/customers/login - DEPRECATED alias → dùng /api/auth/login
// BUG FIX: endpoint này trước đây hardcode scope ROLE_CUSTOMER, gây ra lỗi
// Admin/Staff đăng nhập qua đây sẽ nhận token với role sai.
// Giờ chuyển sang dùng đúng logic detect role từ Spring Boot.
const { STAFF_TYPE } = require('../config/constants');
const login = async (req, res, next) => {
  try {
    const response = await springApi.post('/auth/login', req.body);
    const user = response.data.result || response.data;

    // Kiểm tra lỗi từ Spring Boot (HTTP 200 nhưng có error code bên trong)
    if (user && user.code && user.code !== 200 && user.code !== 1000) {
      return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401, 'Unauthorized');
    }

    if (!user || (!user.id && !user.email)) {
      return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401, 'Unauthorized');
    }

    // Detect role đúng từ Spring Boot thay vì hardcode CUSTOMER
    const roleField = user.role || user.type || '';
    let scope;
    if (roleField === STAFF_TYPE.ADMIN) {
      scope = ROLES.ADMIN;
    } else if (roleField === STAFF_TYPE.STAFF) {
      scope = ROLES.STAFF;
    } else {
      scope = ROLES.CUSTOMER;
    }

    const token = jwt.sign(
      { sub: user.email, ma: user.id, scope },
      process.env.JWT_SECRET,
      { expiresIn: scope === ROLES.CUSTOMER ? '24h' : '8h' }
    );

    return successResponse(res, { token, user, scope }, 'Đăng nhập thành công');
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
    const response = await springApi.get(`/customers/${req.user.ma}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
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
    const response = await springApi.put(`/customers/${req.user.ma}`, req.body, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
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
    await springApi.put(`/customers/${req.user.ma}/change-password`, req.body, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
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
// Frontend gửi: { idToken: "<Google ID Token>" }
// Node.js xác thực với Google, lấy thông tin thật rồi gọi Spring Boot
const googleLogin = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return errorResponse(res, 'Thiếu Google ID Token', 400, 'Bad Request');
    }

    // ✅ Xác thực ID Token với Google
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (googleErr) {
      console.error('[GoogleLogin] ❌ Xác thực Google token thất bại:', googleErr.message);
      return errorResponse(res, 'Google ID Token không hợp lệ hoặc đã hết hạn', 401, 'Unauthorized');
    }

    // Lấy thông tin user từ Google
    const { sub: idGoogle, email, name, picture } = payload;

    console.log(`[GoogleLogin] ✅ Xác thực thành công: email=${email}, idGoogle=${idGoogle}`);

    // Gọi Spring Boot với thông tin đã xác thực (không thể bị giả mạo)
    const response = await springApi.post('/customers/google', { idGoogle, email, name });
    const data = response.data;

    const errorCode = data?.code ?? data?.data?.code;
    if (errorCode && errorCode !== 200 && errorCode !== 201) {
      const errorMessage = data?.message ?? data?.data?.message ?? 'Đăng nhập Google thất bại';
      return errorResponse(res, errorMessage, 400, 'Bad Request');
    }

    const customer = data?.result ?? data;

    // Tạo JWT nội bộ
    const token = jwt.sign(
      { sub: customer.email, ma: customer.id, scope: ROLES.CUSTOMER },
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
    await springApi.put(`/customers/${req.user.ma}/deactivate`, {}, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, null, 'Vô hiệu hóa tài khoản thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

module.exports = { register, login, logout, getProfile, updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword, googleLogin, deactivate };
