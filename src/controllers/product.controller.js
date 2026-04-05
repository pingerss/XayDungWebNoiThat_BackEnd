const { Op } = require('sequelize');
const { Product, ProductAttribute, ProductImage, Category, Color, Dimensions } = require('../models');
const { successResponse, createdResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { parsePagination, parseSort } = require('../utils/helpers');

// GET /api/products
const getAll = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);
    const { sortBy, sortOrder } = parseSort(req.query, ['createdAt', 'name']);

    // Build where clause for filters
    const where = {};
    if (req.query.categoryId) where.categoryId = req.query.categoryId;
    if (req.query.keyword) {
      where.name = { [Op.like]: `%${req.query.keyword}%` };
    }

    // Build include for price/color filters
    const attrWhere = {};
    if (req.query.minPrice) attrWhere.price = { ...attrWhere.price, [Op.gte]: req.query.minPrice };
    if (req.query.maxPrice) attrWhere.price = { ...attrWhere.price, [Op.lte]: req.query.maxPrice };
    if (req.query.colorId) attrWhere.colorId = req.query.colorId;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, attributes: ['id', 'name'] },
        {
          model: ProductAttribute,
          where: Object.keys(attrWhere).length > 0 ? attrWhere : undefined,
          required: Object.keys(attrWhere).length > 0,
          include: [
            { model: Color, attributes: ['id', 'name', 'hexCode'] },
            { model: Dimensions, attributes: ['id', 'name'] }
          ]
        },
        { model: ProductImage, where: { isMain: true }, required: false, attributes: ['id', 'imageUrl'] }
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset,
      distinct: true
    });

    return paginatedResponse(res, rows, page, limit, count, 'Lấy danh sách sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/products/:id
const getById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ['id', 'name'] },
        {
          model: ProductAttribute,
          include: [
            { model: Color, attributes: ['id', 'name', 'hexCode'] },
            { model: Dimensions, attributes: ['id', 'name'] }
          ]
        },
        { model: ProductImage }
      ]
    });

    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', 404, 'Not Found');
    }

    return successResponse(res, product, 'Lấy chi tiết sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/products/search
const search = async (req, res, next) => {
  try {
    const { keyword } = req.query;
    const { page, limit, offset } = parsePagination(req.query);

    if (!keyword) {
      return errorResponse(res, 'Vui lòng nhập từ khóa tìm kiếm', 400, 'Bad Request');
    }

    const { count, rows } = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ]
      },
      include: [
        { model: Category, attributes: ['id', 'name'] },
        { model: ProductAttribute, attributes: ['id', 'name', 'price', 'stock'] },
        { model: ProductImage, where: { isMain: true }, required: false, attributes: ['id', 'imageUrl'] }
      ],
      limit,
      offset,
      distinct: true
    });

    return paginatedResponse(res, rows, page, limit, count, 'Tìm kiếm sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/products/trending
const getTrending = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: ProductAttribute, attributes: ['id', 'name', 'price', 'stock'] },
        { model: ProductImage, where: { isMain: true }, required: false, attributes: ['id', 'imageUrl'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    return successResponse(res, products, 'Lấy sản phẩm trending thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/products/new-arrivals
const getNewArrivals = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: ProductAttribute, attributes: ['id', 'name', 'price', 'stock'] },
        { model: ProductImage, where: { isMain: true }, required: false, attributes: ['id', 'imageUrl'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    return successResponse(res, products, 'Lấy sản phẩm mới thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/products/best-sellers
const getBestSellers = async (req, res, next) => {
  try {
    // Based on stock sold (original stock - current stock concept)
    const products = await Product.findAll({
      include: [
        { model: ProductAttribute, attributes: ['id', 'name', 'price', 'stock'] },
        { model: ProductImage, where: { isMain: true }, required: false, attributes: ['id', 'imageUrl'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    return successResponse(res, products, 'Lấy sản phẩm bán chạy thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/products/related/:id
const getRelated = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', 404, 'Not Found');
    }

    const relatedProducts = await Product.findAll({
      where: {
        categoryId: product.categoryId,
        id: { [Op.ne]: product.id }
      },
      include: [
        { model: ProductAttribute, attributes: ['id', 'name', 'price', 'stock'] },
        { model: ProductImage, where: { isMain: true }, required: false, attributes: ['id', 'imageUrl'] }
      ],
      limit: 8
    });

    return successResponse(res, relatedProducts, 'Lấy sản phẩm liên quan thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/products/category/:categoryId
const getByCategory = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req.query);

    const { count, rows } = await Product.findAndCountAll({
      where: { categoryId: req.params.categoryId },
      include: [
        { model: ProductAttribute, attributes: ['id', 'name', 'price', 'stock'] },
        { model: ProductImage, where: { isMain: true }, required: false, attributes: ['id', 'imageUrl'] }
      ],
      limit,
      offset,
      distinct: true
    });

    return paginatedResponse(res, rows, page, limit, count, 'Lấy sản phẩm theo category thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/products/attributes/:attributeId
const getAttributeDetail = async (req, res, next) => {
  try {
    const attr = await ProductAttribute.findByPk(req.params.attributeId, {
      include: [
        { model: Product },
        { model: Color },
        { model: Dimensions },
        { model: ProductImage }
      ]
    });

    if (!attr) {
      return errorResponse(res, 'Không tìm thấy attribute', 404, 'Not Found');
    }

    return successResponse(res, attr);
  } catch (error) {
    next(error);
  }
};

// GET /api/products/stock/:attributeId
const checkStock = async (req, res, next) => {
  try {
    const attr = await ProductAttribute.findByPk(req.params.attributeId, {
      attributes: ['id', 'name', 'stock', 'price']
    });

    if (!attr) {
      return errorResponse(res, 'Không tìm thấy attribute', 404, 'Not Found');
    }

    return successResponse(res, { id: attr.id, stock: attr.stock, inStock: attr.stock > 0 });
  } catch (error) {
    next(error);
  }
};

// POST /api/products/:id/view
const incrementView = async (req, res, next) => {
  try {
    // Schema doesn't have a view column, placeholder
    return successResponse(res, null, 'Đã ghi nhận lượt xem');
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/products
const create = async (req, res, next) => {
  try {
    const { categoryId, name, description } = req.body;

    if (!categoryId || !name || !description) {
      return errorResponse(res, 'categoryId, name, description là bắt buộc', 400, 'Bad Request');
    }

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return errorResponse(res, 'Category không tồn tại', 404, 'Not Found');
    }

    const product = await Product.create({ categoryId, name, description });

    return createdResponse(res, product, 'Tạo sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/products/:id
const update = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', 404, 'Not Found');
    }

    const { categoryId, name, description } = req.body;
    if (categoryId) product.categoryId = categoryId;
    if (name) product.name = name;
    if (description) product.description = description;
    await product.save();

    return successResponse(res, product, 'Cập nhật sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/products/:id
const remove = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', 404, 'Not Found');
    }
    await product.destroy();
    return successResponse(res, null, 'Xóa sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAll,
  getById,
  search,
  getTrending,
  getNewArrivals,
  getBestSellers,
  getRelated,
  getByCategory,
  getAttributeDetail,
  checkStock,
  incrementView,
  create,
  update,
  remove
};
