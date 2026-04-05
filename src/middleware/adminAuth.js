const verifyAdmin = (req, res, next) => {
  if (req.user && (req.user.scope === 'ROLE_ADMIN' || req.user.scope === 'ROLE_STAFF')) {
    next();
  } else {
    res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Access Denied. Admin/Staff role required.',
      path: req.originalUrl
    });
  }
};

const verifyStrictAdmin = (req, res, next) => {
  if (req.user && req.user.scope === 'ROLE_ADMIN') {
    next();
  } else {
    res.status(403).json({
      status: 403,
      error: 'Forbidden',
      message: 'Access Denied. Only Admin can perform this action.',
      path: req.originalUrl
    });
  }
};

module.exports = { verifyAdmin, verifyStrictAdmin };
