const { sequelize, Category, Color, Dimensions, Product, ProductAttribute, ProductImage } = require('./models');
const { faker } = require('@faker-js/faker');

async function seedData() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // 1. Seed Categories if empty
    let categories = await Category.findAll();
    if (categories.length === 0) {
      const categoryNames = ['Sofa', 'Bàn trà', 'Giường ngủ', 'Tủ quần áo', 'Bàn ăn', 'Ghế ăn', 'Kệ tivi', 'Bàn làm việc'];
      for (const name of categoryNames) {
        await Category.create({ name });
      }
      categories = await Category.findAll();
      console.log(`Created ${categories.length} categories.`);
    }

    // 2. Seed Colors if empty
    let colors = await Color.findAll();
    if (colors.length === 0) {
      const colorNames = ['Trắng', 'Đen', 'Xám', 'Nâu', 'Be', 'Xanh dương', 'Xanh lá', 'Cam'];
      for (const name of colorNames) {
        await Color.create({ name, hexCode: '#000000' }); // using dummy hex code
      }
      colors = await Color.findAll();
      console.log(`Created ${colors.length} colors.`);
    }

    // 3. Seed Dimensions if empty
    let dimensions = await Dimensions.findAll();
    if (dimensions.length === 0) {
      const dimensionValues = ['1m2', '1m4', '1m6', '1m8', '2m', 'Free size', 'Tiêu chuẩn'];
      for (const size of dimensionValues) {
        await Dimensions.create({ name: size });
      }
      dimensions = await Dimensions.findAll();
      console.log(`Created ${dimensions.length} dimensions.`);
    }

    // 4. Seed Products
    console.log('Seeding products...');
    let totalProducts = 0;
    for (const category of categories) {
      for (let i = 0; i < 20; i++) {
        // Create Product
        const product = await Product.create({
          categoryId: category.id,
          name: `${category.name} ${faker.commerce.productAdjective()} ${faker.number.int({ min: 100, max: 999 })}`,
          description: faker.commerce.productDescription(),
        });
        totalProducts++;

        // Select random colors and dimensions
        const numAttributes = faker.number.int({ min: 1, max: 3 });
        for (let j = 0; j < numAttributes; j++) {
          const color = faker.helpers.arrayElement(colors);
          const dimension = faker.helpers.arrayElement(dimensions);
          
          const attribute = await ProductAttribute.create({
            productId: product.id,
            colorId: color.id,
            dimensionsId: dimension.id,
            name: `${product.name} - ${color.name} - ${dimension.name}`,
            price: parseFloat(faker.commerce.price({ min: 1000000, max: 50000000 })),
            stock: faker.number.int({ min: 10, max: 100 })
          });

          // Create Product Images
          const numImages = faker.number.int({ min: 1, max: 2 });
          for (let k = 0; k < numImages; k++) {
            await ProductImage.create({
              productId: product.id,
              productAttributeId: attribute.id,
              imageUrl: faker.image.urlLoremFlickr({ category: 'furniture' }),
              isMain: k === 0 // first image is main
            });
          }
        }
      }
      console.log(`Seeded 20 products for category ${category.name}`);
    }

    console.log(`Successfully seeded ${totalProducts} products in total.`);
    
  } catch (error) {
    console.error('Unable to connect to the database or seed:', error);
  } finally {
    await sequelize.close();
  }
}

seedData();
