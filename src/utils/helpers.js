const { v4: uuidv4 } = require('uuid');

// Generate session ID for cart
const generateSessionId = () => {
  return uuidv4();
};

// Parse pagination params
const parsePagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 20;
  const offset = (page - 1) * limit;
  return { page, limit, offset };
};

// Parse sort params
const parseSort = (query, allowedFields = ['createdAt']) => {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : 'createdAt';
  const sortOrder = ['ASC', 'DESC'].includes(query.sortOrder?.toUpperCase()) ? query.sortOrder.toUpperCase() : 'DESC';
  return { sortBy, sortOrder };
};

module.exports = {
  generateSessionId,
  parsePagination,
  parseSort
};
