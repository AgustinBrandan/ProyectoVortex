const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");

const Appointment = require("../models/appointment");
const Doctor = require("../models/doctor");

// Crear Turno (Administrador)
const createAppointment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMap = {
      doctorId: "Debes ingresar un doctor",
      dateTime: "Ingrese fecha y hora en formato YYYY-MM-DDTHH:MM:SS.000Z",
    };

    const individualErrors = errors.array().map((error) => {
      const message = errorMap[error.path];
      return message ? message : "Revisar los datos";
    });

    if (individualErrors.length > 0) {
      return next(new HttpError(individualErrors, 422));
    }
  }

  const { doctorId, dateTime } = req.body;

  try {
    // Verificar si el médico existe
    const existingDoctor = await Doctor.findById(doctorId);
    if (!existingDoctor) {
      return next(new HttpError("El médico no existe.", 404));
    }

    // Verificar si el turno ya existe para la fecha y hora especificadas
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      dateTime,
    });

    if (existingAppointment) {
      return next(
        new HttpError("El turno para esta fecha y hora ya existe.", 409)
      );
    }

    // Crear un nuevo turno
    const newAppointment = new Appointment({
      doctor: doctorId,
      dateTime,
    });

    await newAppointment.save();

    res.status(201).json({ appointment: newAppointment });
  } catch (error) {
    return next(new HttpError("No se pudo crear el turno.", 500));
  }
};

// Modificar Turno (Administrador)
const updateAppointment = async (req, res, next) => {
  const { appointmentId } = req.params;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMap = {
      dateTime: "Ingrese fecha y hora en formato YYYY-MM-DDTHH:MM:SS.000Z",
    };
    const individualErrors = errors.array().map((error) => {
      const message = errorMap[error.path];
      return message ? message : "Revisar los datos";
    });

    if (individualErrors.length > 0) {
      return next(new HttpError(individualErrors, 422));
    }
  }


  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    // Check and update fields if they exist in the request body
    if ("dateTime" in req.body) {
      appointment.dateTime = req.body.dateTime;
    }

    if ("status" in req.body) {
      appointment.status = req.body.status;
    }

    if ("user" in req.body) {
      appointment.user = req.body.user;
    }

    await appointment.save();

    res.status(200).json({ appointment });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al actualizar el turno" });
  }
};

module.exports = {
  createAppointment,
  updateAppointment,
};
