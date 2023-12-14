const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");
const Doctor = require("../models/doctor");
const Specialty = require("../models/specialty");

const createDoctor = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMap = {
      name: "El nombre del medico no puede estar vacío",
      specialty: "Ingrese una especialidad",
    };

    const individualErrors = errors.array().map((error) => {
      const message = errorMap[error.path];
      return message ? message : "Revisar los datos";
    });

    if (individualErrors.length > 0) {
      return next(new HttpError(individualErrors, 422));
    }
  }
  const { name, specialty } = req.body;

  try {
    const existingDoctor = await Doctor.findOne({ name });

    if (existingDoctor) {
      return next(new HttpError("El médico ya existe en el sistema", 422));
    }

    let doctorSpecialty = null;

    if (specialty) {
      doctorSpecialty = await Specialty.findOne({ name: specialty });

      if (!doctorSpecialty) {
        return next(
          new HttpError("La especialidad especificada no existe.", 404)
        );
      }
    }

    const newDoctor = new Doctor({
      name,
      specialty: doctorSpecialty._id,
    });

    await newDoctor.save();

    res.status(201).json({ doctor: newDoctor });
  } catch (error) {
    return next(
      new HttpError("No se pudo crear al médico, inténtalo de nuevo", 500)
    );
  }
};

const updateDoctor = async (req, res, next) => {
  const doctorId = req.params.doctorId;
  const { name, specialty } = req.body;

  try {
    let doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return next(new HttpError("El médico no se encontró en el sistema", 404));
    }

    // Si se proporciona un nombre, actualizar el nombre del médico
    if (name) {
      doctor.name = name;
    }

    // Si se proporciona una especialidad, actualizarla 
    if (specialty) {
      const doctorSpecialty = await Specialty.findOne({ name: specialty });

      if (!doctorSpecialty) {
        return next(new HttpError("La especialidad especificada no existe.", 404));
      }

      doctor.specialty = doctorSpecialty._id;
    }

   
    await doctor.save();

    res.status(200).json({ doctor: doctor });
  } catch (error) {
    return next(new HttpError("No se pudo actualizar al médico, inténtalo de nuevo", 500));
  }
};

const getAllDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find().populate('specialty', 'name'); // Utilizamos populate para obtener los nombres de las especialidades

    res.status(200).json({ doctors: doctors });
  } catch (error) {
    return next(new HttpError("No se pudo obtener la lista de médicos", 500));
  }
};

// const getDoctorDetails = async (req, res, next) => {
//   const doctorId = req.params.doctorId;

//   try {
//     const doctor = await Doctor.findById(doctorId).populate('specialty', 'name').populate({
//       path: 'appointments',
//       match: { status: 'available' }, // Filtramos solo los turnos disponibles
//       select: 'date hour status'
//     });

//     if (!doctor) {
//       return next(new HttpError("El médico no se encontró en el sistema", 404));
//     }

//     res.status(200).json({ doctor: doctor });
//   } catch (error) {
//     return next(new HttpError("No se pudo obtener el detalle del médico", 500));
//   }
// };

module.exports = {
  createDoctor,
  updateDoctor,
  getAllDoctors,
  // getDoctorDetails,
};


module.exports = {
  createDoctor,
  updateDoctor,
  getAllDoctors
};


