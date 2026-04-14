// STAFF CONTROLLER - Proxy to Spring Boot
const { springApi, withUserHeaders } = require('../services/springboot.service');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

// Lấy raw JWT token từ Authorization header (bỏ prefix "Bearer ")
const getToken = (req) => {
  const auth = req.headers.authorization || '';
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
};

const logout = async (req, res, next) => {
  return successResponse(res, null, 'Đăng xuất thành công');
};

const getProfile = async (req, res, next) => {
  try {
    const response = await springApi.get(`/staff/${req.user.ma}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, response.data, 'Lấy profile thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const response = await springApi.put(`/staff/${req.user.ma}`, req.body, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    return successResponse(res, response.data, 'Cập nhật profile thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    console.log('[Staff ChangePassword] userId:', req.user.ma, 'body:', req.body);
    const response = await springApi.put(`/staff/${req.user.ma}/change-password`, req.body, withUserHeaders(req.user.ma, req.user.scope, getToken(req)));
    console.log('[Staff ChangePassword] Spring response:', JSON.stringify(response.data));
    return successResponse(res, null, 'Đổi mật khẩu thành công');
  } catch (error) {
    if (error.statusCode === 503) return errorResponse(res, error.message, 503, 'Service Unavailable');
    if (error.response) {
      console.error('[Staff ChangePassword] Spring error:', error.response.status, JSON.stringify(error.response.data));
      return errorResponse(res, error.response.data?.message || 'Đổi mật khẩu thất bại', error.response.status);
    }
    next(error);
  }
};

// === ADMIN ===
const adminGetAll = async (req, res, next) => {
  try { const r = await springApi.get('/staff', withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminCreate = async (req, res, next) => {
  try { const r = await springApi.post('/staff', req.body, withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return createdResponse(res, r.data, 'Tạo staff thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); if (e.response) return errorResponse(res, e.response.data?.message || 'Tạo thất bại', e.response.status); next(e); }
};
const adminGetById = async (req, res, next) => {
  try { const r = await springApi.get(`/staff/${req.params.id}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, r.data); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminUpdate = async (req, res, next) => {
  try { const r = await springApi.put(`/staff/${req.params.id}`, req.body, withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, r.data, 'Cập nhật thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminDelete = async (req, res, next) => {
  try { await springApi.delete(`/staff/${req.params.id}`, withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, null, 'Xóa thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminActivate = async (req, res, next) => {
  try { const r = await springApi.put(`/staff/${req.params.id}/activate`, {}, withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, r.data, 'Kích hoạt thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};
const adminDeactivate = async (req, res, next) => {
  try { const r = await springApi.put(`/staff/${req.params.id}/deactivate`, {}, withUserHeaders(req.user.ma, req.user.scope, getToken(req))); return successResponse(res, r.data, 'Vô hiệu hóa thành công'); }
  catch (e) { if (e.statusCode === 503) return errorResponse(res, e.message, 503); next(e); }
};

module.exports = { logout, getProfile, updateProfile, changePassword, adminGetAll, adminCreate, adminGetById, adminUpdate, adminDelete, adminActivate, adminDeactivate };
