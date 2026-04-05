const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Access Denied. No token provided.',
      path: req.originalUrl
    });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid Token.',
      path: req.originalUrl
    });
  }
};

module.exports = verifyToken;
