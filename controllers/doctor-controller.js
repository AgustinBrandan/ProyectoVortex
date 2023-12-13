const { validationResult } = require('express-validator');
const HttpError = require('../models/http.error');
const Doctor = require('../models/doctor');
const Specialty = require('../models/specialty');

const createDoctor = async (req, res, next) => {
    const errors = validationResult(req);
  
    if (!errors.isEmpty()) {
      const errorMap = {
        name: 'El nombre del medico no puede estar vacío',
        specialty: 'Ingrese una especialidad',
      };
  
      const individualErrors = errors.array().map((error) => {
        const message = errorMap[error.path];
        return message ? message : 'Revisar los datos';
      });
  
      if (individualErrors.length > 0) {
        return next(new HttpError(individualErrors, 422));
      }
    }
    const { name, specialty } = req.body;
  
    try {
      const existingDoctor = await Doctor.findOne({ name });
  
      if (existingDoctor) {
        return next(new HttpError('El médico ya existe en el sistema', 422));
      }
  
      let doctorSpecialty = null;
  
      if (specialty) {
        doctorSpecialty = await Specialty.findOne({ name: specialty });
  
        if (!doctorSpecialty) {
          return next(new HttpError('La especialidad especificada no existe.', 404));
        }
      }
  
      const newDoctor = new Doctor({
        name,
        specialty: doctorSpecialty._id,
      });
  
      await newDoctor.save();
  
      res.status(201).json({ doctor: newDoctor });
    } catch (error) {
      return next(new HttpError('No se pudo crear al médico, inténtalo de nuevo', 500));
    }
  };
  

module.exports = {
    createDoctor,
};
