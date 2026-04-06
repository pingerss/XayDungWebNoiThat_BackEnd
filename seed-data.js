const { sequelize, Category, Color, Dimensions, Product, ProductAttribute, ProductImage } = require('./src/models');

const seedData = async () => {
  try {
    // 1. Kết nối và đồng bộ database
    console.log('🔄 Đang kết nối database...');
    await sequelize.authenticate();
    console.log('✅ Đã kết nối TiDB Serverless');

    // Bạn có thể đổi sang sync({ force: true }) nếu muốn XOÁ SẠCH data cũ trước khi seed. 
    // Hiện tại chỉ alter để giữ cấu trúc.
    await sequelize.sync(); 

    // 2. Tạo dữ liệu Category
    console.log('📦 Đang tạo danh mục...');
    const categories = await Category.bulkCreate([
      { name: 'Sofa' },
      { name: 'Giường ngủ' },
      { name: 'Bàn ăn' }
    ]);

    // 3. Tạo dữ liệu Color
    console.log('🎨 Đang tạo màu sắc...');
    const colors = await Color.bulkCreate([
      { name: 'Xám', hexCode: '#808080' },
      { name: 'Nâu Gỗ', hexCode: '#8B4513' },
      { name: 'Trắng Sứ', hexCode: '#F8F8FF' }
    ]);

    // 4. Tạo dữ liệu Dimensions (Kích thước)
    console.log('📏 Đang tạo kích thước...');
    const dimensions = await Dimensions.bulkCreate([
      { name: '180x200 cm' },
      { name: '160x200 cm' },
      { name: '200x90x80 cm' },
      { name: '140x80x75 cm' }
    ]);

    // 5. Tạo dữ liệu Product
    console.log('🛋️ Đang tạo sản phẩm...');
    const products = await Product.bulkCreate([
      {
        categoryId: categories[0].id, // Sofa
        name: 'Sofa Băng Cao Cấp Bắc Âu',
        description: 'Sofa băng với thiết kế hiện đại, bọc vải linen nỉ cao cấp, đệm mút D40 êm ái chống xẹp lún. Phù hợp cho phòng khách chung cư.'
      },
      {
        categoryId: categories[1].id, // Giường
        name: 'Giường Ngủ Gỗ Sồi Tân Cổ Điển',
        description: 'Giường ngủ làm từ 100% gỗ sồi tự nhiên nhập khẩu Mỹ, chống mối mọt, thiết kế vạt cong trợ lực siêu bền bỉ.'
      },
      {
        categoryId: categories[2].id, // Bàn ăn
        name: 'Bộ Bàn Ăn Mặt Đá Nung Kết',
        description: 'Bộ bàn ăn 4 ghế mặt đá ceramic chống ố, chống xước hoàn hảo. Khung thép sơn tĩnh điện.'
      }
    ]);

    // 6. Tạo dữ liệu Product Attributes (Biến thể sản phẩm)
    console.log('🏷️ Đang tạo thuộc tính & biến thể...');
    const attributes = await ProductAttribute.bulkCreate([
      // Sofa Biến thể 1
      {
        productId: products[0].id,
        colorId: colors[0].id, // Xám
        dimensionsId: dimensions[2].id, // 200x90x80
        name: 'Sofa Băng - Xám - 200cm',
        price: 5500000,
        stock: 15
      },
      // Giường ngủ Biến thể 1 & 2
      {
        productId: products[1].id,
        colorId: colors[1].id, // Nâu gỗ
        dimensionsId: dimensions[0].id, // 180x200
        name: 'Giường Sồi - Nâu - 1.8m',
        price: 8900000,
        stock: 5
      },
      {
        productId: products[1].id,
        colorId: colors[1].id, // Nâu gỗ
        dimensionsId: dimensions[1].id, // 160x200
        name: 'Giường Sồi - Nâu - 1.6m',
        price: 7900000,
        stock: 10
      },
      // Bàn ăn Biến thể 1
      {
        productId: products[2].id,
        colorId: colors[2].id, // Trắng
        dimensionsId: dimensions[3].id, // 140x80
        name: 'Bàn Ăn Đá - Trắng - 1.4m',
        price: 6500000,
        stock: 8
      }
    ]);

    // 7. Tạo Product Images (Ảnh thật từ Unsplash)
    console.log('📸 Đang tạo hình ảnh sản phẩm...');
    await ProductImage.bulkCreate([
      // Ảnh Sofa
      {
        productId: products[0].id,
        productAttributeId: attributes[0].id,
        imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
        isMain: true
      },
      {
        productId: products[0].id,
        productAttributeId: attributes[0].id,
        imageUrl: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1200&q=80',
        isMain: false
      },
      // Ảnh Giường
      {
        productId: products[1].id,
        productAttributeId: attributes[1].id,
        imageUrl: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=1200&q=80',
        isMain: true
      },
      {
        productId: products[1].id,
        productAttributeId: attributes[2].id,
        imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
        isMain: false
      },
      // Ảnh Bàn Ăn
      {
        productId: products[2].id,
        productAttributeId: attributes[3].id,
        imageUrl: 'https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=1200&q=80',
        isMain: true
      }
    ]);

    console.log('🎉 ĐÃ SEED DỮ LIỆU THÀNH CÔNG!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    process.exit(1);
  }
};

seedData();
