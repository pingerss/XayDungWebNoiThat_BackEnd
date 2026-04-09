/**
 * Seed tài khoản Admin & Staff trực tiếp vào TiDB Cloud
 * Hash password theo chuẩn $2a$ để tương thích với Spring Boot BCryptPasswordEncoder
 *
 * Cách dùng: node seed-staff.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Staff } = require('./src/models');

// =============================================
// DANH SÁCH TÀI KHOẢN CẦN TẠO
// =============================================
const accounts = [
  {
    name: 'Super Admin',
    email: 'admin@noithat.com',
    password: 'Admin@123456',
    type: 'Admin',
    isActive: true,
  },
  {
    name: 'Nguyễn Văn A',
    email: 'nhanvien1@noithat.com',
    password: 'Staff@123456',
    type: 'Staff',
    isActive: true,
  },
  {
    name: 'Trần Thị B',
    email: 'nhanvien2@noithat.com',
    password: 'Staff@123456',
    type: 'Staff',
    isActive: true,
  },
];

/**
 * bcryptjs tạo hash với prefix $2b$ nhưng Spring Boot BCryptPasswordEncoder
 * dùng $2a$ — đổi prefix để Spring Boot verify đúng.
 */
function toSpringBcrypt(hash) {
  return hash.replace(/^\$2b\$/, '$2a$');
}

async function seedStaff() {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối TiDB Cloud thành công!\n');

    for (const account of accounts) {
      // Kiểm tra email đã tồn tại chưa
      const existing = await Staff.findOne({ where: { email: account.email } });

      if (existing) {
        console.log(`⚠️  [${account.email}] đã tồn tại, bỏ qua.\n`);
        continue;
      }

      // Hash password theo chuẩn Spring Boot ($2a$)
      const rawHash = await bcrypt.hash(account.password, 10);
      const springHash = toSpringBcrypt(rawHash);

      const staff = await Staff.create({
        name: account.name,
        email: account.email,
        password: springHash,
        type: account.type,
        isActive: account.isActive,
      });

      console.log(`✅ Đã tạo tài khoản ${account.type.toUpperCase()}:`);
      console.log(`   - ID       : ${staff.id}`);
      console.log(`   - Tên      : ${staff.name}`);
      console.log(`   - Email    : ${staff.email}`);
      console.log(`   - Mật khẩu: ${account.password}  (lưu DB: ${springHash.substring(0, 20)}...)`);
      console.log(`   - Loại     : ${staff.type}\n`);
    }

    console.log('🎉 Seed hoàn tất!');
    console.log('👉 Test login: POST /api/staff/login');
    console.log('   Body: { "email": "admin@noithat.com", "password": "Admin@123456" }');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    if (error.original) console.error('   Chi tiết:', error.original.message);
  } finally {
    await sequelize.close();
  }
}

seedStaff();
