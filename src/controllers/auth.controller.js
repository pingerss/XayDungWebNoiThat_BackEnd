// AUTH CONTROLLER - Unified Login
// 1 URL duy nhất: POST /api/auth/login
// Tự động xác định role dựa vào response từ Spring Boot

const jwt = require('jsonwebtoken');
const { springApi } = require('../services/springboot.service');
const { successResponse, errorResponse } = require('../utils/response');
const { ROLES, STAFF_TYPE } = require('../config/constants');

/**
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Spring Boot trả về:
 *   - Customer: { id, email, ... }        → scope = ROLE_CUSTOMER
 *   - Staff:    { id, email, type: 'Staff', ... }  → scope = ROLE_STAFF
 *   - Admin:    { id, email, type: 'Admin', ... }  → scope = ROLE_ADMIN
 *
 * JWT trả về có field `scope` để frontend biết role.
 */
const unifiedLogin = async (req, res, next) => {
  try {
    const response = await springApi.post('/auth/login', req.body);
    const user = response.data.result || response.data;

    // Spring Boot có thể trả về HTTP 200 nhưng chứa code lỗi bên trong
    // Ví dụ: { code: 2998, message: "Không tìm thấy người dùng" }
    if (user && user.code && user.code !== 200 && user.code !== 1000) {
      return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401, 'Unauthorized');
    }

    // Kiểm tra user có hợp lệ không (phải có id hoặc email)
    if (!user || (!user.id && !user.email)) {
      return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401, 'Unauthorized');
    }

    // Xác định role dựa vào field `role` hoặc `type` từ Spring Boot
    // Spring Boot có thể trả về: role: "Admin" | "Staff" | "Customer"
    //                        hoặc: type: "Admin" | "Staff"
    const roleField = user.role || user.type || '';
    let scope;
    if (roleField === STAFF_TYPE.ADMIN) {
      scope = ROLES.ADMIN;
    } else if (roleField === STAFF_TYPE.STAFF) {
      scope = ROLES.STAFF;
    } else {
      scope = ROLES.CUSTOMER;
    }

    // Tạo JWT chứa đầy đủ thông tin role
    const token = jwt.sign(
      {
        sub: user.email,
        maKH: user.id,
        scope
      },
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

module.exports = { unifiedLogin };
