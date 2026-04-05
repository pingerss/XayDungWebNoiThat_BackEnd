// Standard API Response Helpers

const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    timestamp: new Date().toISOString(),
    status: statusCode,
    message,
    data
  });
};

const createdResponse = (res, data, message = 'Created successfully') => {
  return successResponse(res, data, message, 201);
};

const errorResponse = (res, message = 'Something went wrong', statusCode = 500, error = 'Internal Server Error') => {
  return res.status(statusCode).json({
    timestamp: new Date().toISOString(),
    status: statusCode,
    error,
    message,
    path: res.req.originalUrl
  });
};

const paginatedResponse = (res, data, page, limit, total, message = 'Success') => {
  return res.status(200).json({
    timestamp: new Date().toISOString(),
    status: 200,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse,
  paginatedResponse
};
