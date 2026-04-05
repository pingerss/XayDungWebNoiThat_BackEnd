const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    timestamp: new Date().toISOString(),
    status: statusCode,
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong',
    path: req.originalUrl
  });
};

module.exports = errorHandler;
