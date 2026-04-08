// STAFF CONTROLLER - Proxy to Spring Boot
const jwt = require('jsonwebtoken');
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const { ROLES, STAFF_TYPE } = require('../config/constants');

// POST /api/staff/login
const login = async (req, res, next) => {
  try {
    const response = await springApi.post('/auth/login', req.body);
    const staff = response.data.result || response.data;

    // Node.js tạo JWT
    const scope = staff.type === STAFF_TYPE.ADMIN ? ROLES.ADMIN : ROLES.STAFF;
    const token = jwt.sign(
      { sub: staff.email, maKH: staff.id, scope, type: staff.type },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return successResponse(res, { token, staff }, 'Đăng nhập thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    return errorResponse(res, 'Email hoặc mật khẩu không đúng', 401, 'Unauthorized');
  }
};

const logout = async (req, res, next) => {
  return successResponse(res, null, 'Đăng xuất thành công');
};

const getProfile = async (req, res, next) => {
  try {
    const response = await springApi.get(`/staff/${req.user.maKH}`, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, response.data, 'Lấy profile thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const response = await springApi.put(`/staff/${req.user.maKH}`, req.body, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, response.data, 'Cập nhật profile thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    await springApi.put(`/staff/${req.user.maKH}/change-password`, req.body, withUserHeaders(req.user.maKH, req.user.scope));
    return successResponse(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) return errorResponse(res, error.response.data?.message || 'Đổi mật khẩu thất bại', error.response.status);
    next(error);
  }
};

// === ADMIN ===
const adminGetAll = async (req, res, next) => {
  try { const r = await springApi.get('/staff'); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminCreate = async (req, res, next) => {
  try { const r = await springApi.post('/staff', req.body); return createdResponse(res, r.data, 'Tạo staff thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); if (e.response) return errorResponse(res, e.response.data?.message || 'Tạo thất bại', e.response.status); next(e); }
};
const adminGetById = async (req, res, next) => {
  try { const r = await springApi.get(`/staff/${req.params.id}`); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminUpdate = async (req, res, next) => {
  try { const r = await springApi.put(`/staff/${req.params.id}`, req.body); return successResponse(res, r.data, 'Cập nhật thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminDelete = async (req, res, next) => {
  try { await springApi.delete(`/staff/${req.params.id}`); return successResponse(res, null, 'Xóa thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminActivate = async (req, res, next) => {
  try { const r = await springApi.put(`/staff/${req.params.id}/activate`); return successResponse(res, r.data, 'Kích hoạt thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminDeactivate = async (req, res, next) => {
  try { const r = await springApi.put(`/staff/${req.params.id}/deactivate`); return successResponse(res, r.data, 'Vô hiệu hóa thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};

module.exports = { login, logout, getProfile, updateProfile, changePassword, adminGetAll, adminCreate, adminGetById, adminUpdate, adminDelete, adminActivate, adminDeactivate };
