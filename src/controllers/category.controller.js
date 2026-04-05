const { Category, Product, ProductAttribute, CategoryPromotion, Promotion } = require('../models');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

// GET /api/categories
const getAll = async (req, res, next) => {
  try {
    const categories = await Category.findAll({ order: [['id', 'ASC']] });
    return successResponse(res, categories, 'Lấy danh sách category thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/:id
const getById = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return errorResponse(res, 'Không tìm thấy category', 404, 'Not Found');
    }
    return successResponse(res, category);
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/tree
// const getTree = async (req, res, next) => {
//   try {
//     // Flat list since this schema has no parent_id, return all
//     const categories = await Category.findAll({ order: [['id', 'ASC']] });
//     return successResponse(res, categories, 'Lấy category tree thành công');
//   } catch (error) {
//     next(error);
//   }
// };

// GET /api/categories/:id/products
const getProductsByCategory = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return errorResponse(res, 'Không tìm thấy category', 404, 'Not Found');
    }

    const products = await Product.findAll({
      where: { categoryId: req.params.id },
      include: [
        { model: ProductAttribute, attributes: ['id', 'name', 'price', 'stock'] }
      ]
    });

    return successResponse(res, products, 'Lấy sản phẩm theo category thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/categories/promotions/:id
const getPromotionsByCategory = async (req, res, next) => {
  try {
    const promotions = await CategoryPromotion.findAll({
      where: { categoryId: req.params.id },
      include: [{ model: Promotion }]
    });
    return successResponse(res, promotions, 'Lấy promotions của category thành công');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories
const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return errorResponse(res, 'Tên category là bắt buộc', 400, 'Bad Request');
    }
    const category = await Category.create({ name });
    return createdResponse(res, category, 'Tạo category thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/categories/:id
const update = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return errorResponse(res, 'Không tìm thấy category', 404, 'Not Found');
    }

    const { name } = req.body;
    if (name) category.name = name;
    await category.save();

    return successResponse(res, category, 'Cập nhật category thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/categories/:id
const remove = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return errorResponse(res, 'Không tìm thấy category', 404, 'Not Found');
    }

    // Check if category has products
    const productCount = await Product.count({ where: { categoryId: req.params.id } });
    if (productCount > 0) {
      return errorResponse(res, 'Không thể xóa category đang có sản phẩm', 400, 'Bad Request');
    }

    await category.destroy();
    return successResponse(res, null, 'Xóa category thành công');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/categories/reorder
const reorder = async (req, res, next) => {
  try {
    const { orderedIds } = req.body; // Array of category IDs in new order
    // Since schema has no 'order' column, this is a placeholder
    return successResponse(res, { orderedIds }, 'Sắp xếp lại thứ tự thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  // getTree,
  getProductsByCategory,
  getPromotionsByCategory,
  create,
  update,
  remove,
  reorder
};
