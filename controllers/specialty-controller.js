const { validationResult } = require('express-validator');
const HttpError = require('../models/http.error');
const Specialty = require('../models/specialty');

const createSpecialty = async (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const errorMap = {
        name: 'El nombre no puede estar vacío',
        description: 'La descripción es requerida',
      };
  
      const individualErrors = errors.array().map((error) => {
        const message = errorMap[error.path];
        return message ? message : 'Revisar los datos';
      });
  
      if (individualErrors.length > 0) {
        return next(new HttpError(individualErrors, 422));
      }
    }
  
    const { name, description } = req.body;
  
    try {
      const existingSpecialty = await Specialty.findOne({ name });
      
      if (existingSpecialty) {
        return next(new HttpError('La especialidad ya existe', 422));
      }
  
      const newSpecialty = new Specialty({ name, description });
      await newSpecialty.save();
  
      res.status(201).json({ specialty: newSpecialty });
    } catch (err) {
      return next(
        new HttpError('No se pudo crear la especialidad, inténtalo de nuevo', 500)
      );
    }
  };
  
const getSpecialties = async (req, res, next) => {
    try {
      const specialties = await Specialty.find({});
      res.json({ specialties });
    } catch (error) {
      return next(new HttpError('No se pudo obtener las especialidades', 500));
    }
  };
  
  

module.exports = {
  createSpecialty,
  getSpecialties,
};
