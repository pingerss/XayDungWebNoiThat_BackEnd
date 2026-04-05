const { Color } = require('../models');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

// GET /api/colors
const getAll = async (req, res, next) => {
  try {
    const colors = await Color.findAll({ order: [['id', 'ASC']] });
    return successResponse(res, colors, 'Lấy danh sách màu thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/colors/:id
const getById = async (req, res, next) => {
  try {
    const color = await Color.findByPk(req.params.id);
    if (!color) {
      return errorResponse(res, 'Không tìm thấy màu', 404, 'Not Found');
    }
    return successResponse(res, color);
  } catch (error) {
    next(error);
  }
};

// GET /api/colors/active
const getActive = async (req, res, next) => {
  try {
    const colors = await Color.findAll({ order: [['id', 'ASC']] });
    return successResponse(res, colors, 'Lấy danh sách màu active thành công');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/colors
const create = async (req, res, next) => {
  try {
    const { name, hexCode } = req.body;
    if (!name) {
      return errorResponse(res, 'Tên màu là bắt buộc', 400, 'Bad Request');
    }
    const color = await Color.create({ name, hexCode });
    return createdResponse(res, color, 'Tạo màu thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/colors/:id
const update = async (req, res, next) => {
  try {
    const color = await Color.findByPk(req.params.id);
    if (!color) {
      return errorResponse(res, 'Không tìm thấy màu', 404, 'Not Found');
    }

    const { name, hexCode } = req.body;
    if (name) color.name = name;
    if (hexCode !== undefined) color.hexCode = hexCode;
    await color.save();

    return successResponse(res, color, 'Cập nhật màu thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/colors/:id
const remove = async (req, res, next) => {
  try {
    const color = await Color.findByPk(req.params.id);
    if (!color) {
      return errorResponse(res, 'Không tìm thấy màu', 404, 'Not Found');
    }
    await color.destroy();
    return successResponse(res, null, 'Xóa màu thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  getActive,
  create,
  update,
  remove
};
