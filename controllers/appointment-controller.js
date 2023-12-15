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

    // Asociar la nueva cita al médico
    existingDoctor.appointments.push(newAppointment._id);
    await existingDoctor.save();

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

const deleteAppointment = async (req, res, next) => {
  const { appointmentId } = req.params; // Suponiendo que tienes el ID del turno a eliminar en los parámetros de la URL

  try {
    // Verificar si el turno existe
    const existingAppointment = await Appointment.findById(appointmentId);
    if (!existingAppointment) {
      return next(new HttpError("El turno no existe.", 404));
    }
    // Eliminar el turno
    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: "Turno eliminado exitosamente." });
  } catch (error) {
    return next(new HttpError("No se pudo eliminar el turno.", 500));
  }
};

const listAppointmentsByDoctor = async (req, res, next) => {
  const doctorId = req.params.doctorId;

  try {
    // Buscar las citas del médico por su ID
    const appointments = await Appointment.find({ doctor: doctorId })
      .populate("doctor", "name") // Agregar información del médico (opcional)
      .select("dateTime status"); // Seleccionar campos necesarios

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "No se encontraron turnos para este médico." });
    }

    res.status(200).json({ appointments: appointments });
  } catch (error) {
    console.log(error);
    return next(new HttpError("No se pudieron listar los turnos del médico.", 500));
  }
};

const listAppointmentsByPatient = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    // Buscar las citas del paciente por su ID de usuario
    const appointments = await Appointment.find({ user: userId })
      .populate("doctor", "name") // Agregar información del médico
      .select("dateTime status"); // Seleccionar campos necesarios

    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: "No se encontraron turnos para este paciente." });
    }

    res.status(200).json({ appointments: appointments });
  } catch (error) {
    console.log(error);
    return next(new HttpError("No se pudieron listar los turnos del paciente.", 500));
  }
};


module.exports = {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  listAppointmentsByDoctor,
  listAppointmentsByPatient,
};
