const { Dimensions } = require('../models');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

// GET /api/dimensions
const getAll = async (req, res, next) => {
  try {
    const dimensions = await Dimensions.findAll({ order: [['id', 'ASC']] });
    return successResponse(res, dimensions, 'Lấy danh sách kích thước thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/dimensions/:id
const getById = async (req, res, next) => {
  try {
    const dimension = await Dimensions.findByPk(req.params.id);
    if (!dimension) {
      return errorResponse(res, 'Không tìm thấy kích thước', 404, 'Not Found');
    }
    return successResponse(res, dimension);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/dimensions
const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return errorResponse(res, 'Tên kích thước là bắt buộc', 400, 'Bad Request');
    }
    const dimension = await Dimensions.create({ name });
    return createdResponse(res, dimension, 'Tạo kích thước thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/dimensions/:id
const update = async (req, res, next) => {
  try {
    const dimension = await Dimensions.findByPk(req.params.id);
    if (!dimension) {
      return errorResponse(res, 'Không tìm thấy kích thước', 404, 'Not Found');
    }

    const { name } = req.body;
    if (name) dimension.name = name;
    await dimension.save();

    return successResponse(res, dimension, 'Cập nhật kích thước thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/dimensions/:id
const remove = async (req, res, next) => {
  try {
    const dimension = await Dimensions.findByPk(req.params.id);
    if (!dimension) {
      return errorResponse(res, 'Không tìm thấy kích thước', 404, 'Not Found');
    }
    await dimension.destroy();
    return successResponse(res, null, 'Xóa kích thước thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};
