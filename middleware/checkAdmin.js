const HttpError = require('../models/http.error');

const checkAdmin = (req, res, next) => {
  if (req.userData.role !== 'admin') {
    const error = new HttpError('No tienes permisos de administrador', 403);
    return next(error);
  }
  next();
};

module.exports = checkAdmin;
