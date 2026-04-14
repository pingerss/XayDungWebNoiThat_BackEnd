// ROLE AUTH MIDDLEWARE - Kiểm tra role cụ thể

const { errorResponse } = require('../utils/response');
const { ROLES } = require('../config/constants');

// Chỉ cho phép ROLE_CUSTOMER
const verifyCustomer = (req, res, next) => {
  if (req.user && req.user.scope === ROLES.CUSTOMER) {
    return next();
  }
  return errorResponse(res, 'Chỉ tài khoản khách hàng mới có quyền thực hiện thao tác này.', 403, 'Forbidden');
};

// Chỉ cho phép ROLE_STAFF hoặc ROLE_ADMIN
const verifyStaff = (req, res, next) => {
  if (req.user && (req.user.scope === ROLES.STAFF || req.user.scope === ROLES.ADMIN)) {
    return next();
  }
  return errorResponse(res, 'Chỉ tài khoản nhân viên mới có quyền thực hiện thao tác này.', 403, 'Forbidden');
};

module.exports = { verifyCustomer, verifyStaff };
