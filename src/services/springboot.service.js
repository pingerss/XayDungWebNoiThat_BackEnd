const axios = require('axios');

const SPRING_BOOT_URL = process.env.SPRING_BOOT_URL || 'http://localhost:8080';
const API_KEY = process.env.INTERNAL_API_KEY || 'internal-api-key';

// Create axios instance for Spring Boot calls
const springApi = axios.create({
  baseURL: `${SPRING_BOOT_URL}/api/internal`,
  timeout: 60000, // 60s - Render free tier cần thời gian wake up
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': API_KEY
  }
});

// Add request interceptor for logging
springApi.interceptors.request.use(
  (config) => {
    console.log(`[Spring Boot] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
springApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Spring Boot is not running at', SPRING_BOOT_URL);
      const err = new Error('Service thành phần Spring Boot chưa sẵn sàng. Vui lòng thử lại sau.');
      err.statusCode = 503;
      err.name = 'Service Unavailable';
      throw err;
    }
    throw error;
  }
);

// Helper: forward user info + JWT token to Spring Boot
const withUserHeaders = (userId, userRole, token) => ({
  headers: {
    'X-User-Id': userId,
    'X-User-Role': userRole,
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
});

module.exports = {
  springApi,
  withUserHeaders,
  SPRING_BOOT_URL
};
