const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'src', 'models');

fs.readdir(modelsDir, (err, files) => {
  if (err) {
    console.error('Lỗi khi đọc thư mục:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.js') && file !== 'index.js') {
      const filePath = path.join(modelsDir, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Replace: field: 'Something Like This' => field: 'something_like_this'
      content = content.replace(/field:\s*'([^']+)'/g, (match, fieldName) => {
        // Change to lowercase and replace spaces with underscores
        const newFieldName = fieldName.toLowerCase().replace(/\s+/g, '_');
        return `field: '${newFieldName}'`;
      });

      // Also replace tableName if it has spaces (e.g. 'Product Attributes' => 'product_attributes')
      // and let's just make all tableNames lowercase to match TiDB
      content = content.replace(/tableName:\s*'([^']+)'/g, (match, tableName) => {
        const newTableName = tableName.toLowerCase().replace(/\s+/g, '_');
        return `tableName: '${newTableName}'`;
      });

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Đã sửa file: ${file}`);
    }
  });

  console.log('✅ Hoàn tất! Vui lòng lưu lại và test lại API.');
});
