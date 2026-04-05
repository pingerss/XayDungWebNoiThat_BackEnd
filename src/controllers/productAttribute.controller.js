const { ProductAttribute, Product, Color, Dimensions, ProductImage } = require('../models');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');

// GET /api/product-attributes/product/:productId
const getByProduct = async (req, res, next) => {
  try {
    const attributes = await ProductAttribute.findAll({
      where: { productId: req.params.productId },
      include: [
        { model: Color, attributes: ['id', 'name', 'hexCode'] },
        { model: Dimensions, attributes: ['id', 'name'] },
        { model: ProductImage }
      ]
    });
    return successResponse(res, attributes, 'Lấy attributes theo sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/product-attributes/:id
const getById = async (req, res, next) => {
  try {
    const attr = await ProductAttribute.findByPk(req.params.id, {
      include: [
        { model: Product },
        { model: Color },
        { model: Dimensions },
        { model: ProductImage }
      ]
    });

    if (!attr) {
      return errorResponse(res, 'Không tìm thấy product attribute', 404, 'Not Found');
    }

    return successResponse(res, attr);
  } catch (error) {
    next(error);
  }
};

// GET /api/product-attributes/:id/stock
const checkStock = async (req, res, next) => {
  try {
    const attr = await ProductAttribute.findByPk(req.params.id, {
      attributes: ['id', 'name', 'stock', 'price']
    });

    if (!attr) {
      return errorResponse(res, 'Không tìm thấy product attribute', 404, 'Not Found');
    }

    return successResponse(res, { id: attr.id, stock: attr.stock, inStock: attr.stock > 0 });
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/product-attributes
const create = async (req, res, next) => {
  try {
    const { productId, colorId, dimensionsId, name, price, stock } = req.body;

    if (!productId || !colorId || !dimensionsId || !name || price === undefined) {
      return errorResponse(res, 'productId, colorId, dimensionsId, name, price là bắt buộc', 400, 'Bad Request');
    }

    const product = await Product.findByPk(productId);
    if (!product) return errorResponse(res, 'Product không tồn tại', 404, 'Not Found');

    const attr = await ProductAttribute.create({ productId, colorId, dimensionsId, name, price, stock: stock || 0 });
    return createdResponse(res, attr, 'Tạo product attribute thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/product-attributes/:id
const update = async (req, res, next) => {
  try {
    const attr = await ProductAttribute.findByPk(req.params.id);
    if (!attr) return errorResponse(res, 'Không tìm thấy product attribute', 404, 'Not Found');

    const { colorId, dimensionsId, name, price, stock } = req.body;
    if (colorId !== undefined) attr.colorId = colorId;
    if (dimensionsId !== undefined) attr.dimensionsId = dimensionsId;
    if (name) attr.name = name;
    if (price !== undefined) attr.price = price;
    if (stock !== undefined) attr.stock = stock;
    await attr.save();

    return successResponse(res, attr, 'Cập nhật product attribute thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/product-attributes/:id/stock
const updateStock = async (req, res, next) => {
  try {
    const attr = await ProductAttribute.findByPk(req.params.id);
    if (!attr) return errorResponse(res, 'Không tìm thấy product attribute', 404, 'Not Found');

    const { stock } = req.body;
    if (stock === undefined) return errorResponse(res, 'stock là bắt buộc', 400, 'Bad Request');

    attr.stock = stock;
    await attr.save();

    return successResponse(res, attr, 'Cập nhật stock thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/product-attributes/:id
const remove = async (req, res, next) => {
  try {
    const attr = await ProductAttribute.findByPk(req.params.id);
    if (!attr) return errorResponse(res, 'Không tìm thấy product attribute', 404, 'Not Found');

    await attr.destroy();
    return successResponse(res, null, 'Xóa product attribute thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getByProduct,
  getById,
  checkStock,
  create,
  update,
  updateStock,
  remove
};
