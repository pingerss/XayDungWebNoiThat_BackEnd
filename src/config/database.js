require('dotenv').config();
const { Sequelize } = require('sequelize');

const database = process.env.DB_NAME;
const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const host = process.env.DB_HOST;
const port = process.env.DB_PORT || 4000;

const sequelize = new Sequelize(database, username, password, {
  host: host,
  port: port,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: {
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    },
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  timezone: '+07:00', // Vietnam time
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Kết nối database TiDB Cloud thành công.');
  } catch (error) {
    console.error('❌ Không thể kết nối database:', error);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
