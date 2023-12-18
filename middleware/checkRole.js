const HttpError = require('../models/http.error');

const checkRole = (allowedRole) => {
  let errorMessage = '';

  if (allowedRole === 'admin') {
    errorMessage = 'No tienes los permisos de ADMINISTRADOR';
  } else if (allowedRole === 'user') {
    errorMessage = 'Solo disponible para Pacientes';
  } else {
    errorMessage = 'Acceso denegado. No tienes los permisos necesarios.';
  }

  return (req, res, next) => {
    const { userData } = req; 

    if (!userData || userData.role !== allowedRole) {
      const error = new HttpError(errorMessage, 403);
      return next(error);
    }

    next();
  };
};

module.exports = checkRole;
