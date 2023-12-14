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
      dateTime: "Ingrese fecha y hora en formato ISO8601",
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

    const dateObject = new Date(dateTime);

    const formattedDateTime = dateObject.toISOString(); // Formato ISO8601 de fecha y hora
    const hour = formattedDateTime.split("T")[1].slice(0, 5); // Extraer la hora de la cadena ISO8601

    // Crear un nuevo turno
    const newAppointment = new Appointment({
      doctor: doctorId,
      dateTime,
      hour,
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
      dateTime: "Ingrese fecha ",
    };
    const individualErrors = errors.array().map((error) => {
      const message = errorMap[error.path];
      return message ? message : "Revisar los datos";
    });

    if (individualErrors.length > 0) {
      return next(new HttpError(individualErrors, 422));
    }
  }

  const { dateTime, status, user } = req.body;

  try {
    const dateObject = new Date(dateTime);

    if (isNaN(dateObject.getTime())) { // Verificar si la fecha es inválida
      return next(new HttpError("Fecha inválida. Ingrese una fecha válida en formato Año-Mes-Día", 422));
    }

    const formattedDateTime = dateObject.toISOString(); // Formato ISO8601 de fecha y hora
    const hourformat = formattedDateTime.split("T")[1].slice(0, 5); // Extraer la hora de la cadena ISO8601

    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    appointment.dateTime = formattedDateTime;
    appointment.hour = hourformat;
    appointment.status = status;
    appointment.user = user;

    await appointment.save();

    res.status(200).json({ appointment });
  } catch (error) {
    return res.status(500).json({ message: "Error al actualizar el turno" });
  }
};



module.exports = {
  createAppointment,
  updateAppointment,
};
