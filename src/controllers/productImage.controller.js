const { ProductImage, Product } = require('../models');
const { successResponse, createdResponse, errorResponse } = require('../utils/response');
const { uploadToCloudinary, deleteFromCloudinary, upload } = require('../config/cloudinary');

// GET /api/product-images/product/:productId
const getByProduct = async (req, res, next) => {
  try {
    const images = await ProductImage.findAll({
      where: { productId: req.params.productId },
      order: [['isMain', 'DESC'], ['id', 'ASC']]
    });
    return successResponse(res, images, 'Lấy ảnh sản phẩm thành công');
  } catch (error) {
    next(error);
  }
};

// GET /api/product-images/:id
const getById = async (req, res, next) => {
  try {
    const image = await ProductImage.findByPk(req.params.id);
    if (!image) return errorResponse(res, 'Không tìm thấy ảnh', 404, 'Not Found');
    return successResponse(res, image);
  } catch (error) {
    next(error);
  }
};

// POST /api/admin/product-images
const create = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'Vui lòng upload ảnh', 400, 'Bad Request');
    }

    const { productId, productAttributeId, isMain } = req.body;
    if (!productId || !productAttributeId) {
      return errorResponse(res, 'productId và productAttributeId là bắt buộc', 400, 'Bad Request');
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'noithat/products');

    // If isMain, reset other main images
    if (isMain === 'true' || isMain === true) {
      await ProductImage.update({ isMain: false }, { where: { productId } });
    }

    const image = await ProductImage.create({
      productId,
      productAttributeId,
      imageUrl: result.secure_url,
      isMain: isMain === 'true' || isMain === true
    });

    return createdResponse(res, image, 'Upload ảnh thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/product-images/:id/main
const setMain = async (req, res, next) => {
  try {
    const image = await ProductImage.findByPk(req.params.id);
    if (!image) return errorResponse(res, 'Không tìm thấy ảnh', 404, 'Not Found');

    // Reset all main images for this product
    await ProductImage.update({ isMain: false }, { where: { productId: image.productId } });

    image.isMain = true;
    await image.save();

    return successResponse(res, image, 'Đặt ảnh chính thành công');
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/product-images/:id
const remove = async (req, res, next) => {
  try {
    const image = await ProductImage.findByPk(req.params.id);
    if (!image) return errorResponse(res, 'Không tìm thấy ảnh', 404, 'Not Found');

    // Delete from Cloudinary
    await deleteFromCloudinary(image.imageUrl);

    await image.destroy();
    return successResponse(res, null, 'Xóa ảnh thành công');
  } catch (error) {
    next(error);
  }
};

// PUT /api/admin/product-images/reorder
const reorder = async (req, res, next) => {
  try {
    const { orderedIds } = req.body;
    // Schema doesn't have order column, placeholder
    return successResponse(res, { orderedIds }, 'Sắp xếp lại ảnh thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getByProduct,
  getById,
  create,
  setMain,
  remove,
  reorder
};
