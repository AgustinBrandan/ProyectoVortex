const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");
const Appointment = require("../models/appointment");
const Doctor = require("../models/doctor");

// Crear Turno (Administrador)
const createAppointment = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(422).json({ errors: errorMessages });
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

    res.status(201).json({ message: "El turno fue creado con éxito" });
  } catch (error) {
    return next(new HttpError("No se pudo crear el turno.", 500));
  }
};

// Modificar Turno (Administrador)
const updateAppointment = async (req, res, next) => {
  const { appointmentId } = req.params;
  const { dateTime, status, user } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(422).json({ errors: errorMessages });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({ message: "Turno no encontrado" });
    }

    // Actualizar los campos si existen en el cuerpo de la solicitud
    appointment.dateTime = dateTime || appointment.dateTime;
    appointment.status = status || appointment.status;
    appointment.user = user || appointment.user;

    await appointment.save();

    res.status(200).json({ message: "El turno fue actualizado con exito." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al actualizar el turno" });
  }
};

const deleteAppointment = async (req, res, next) => {
  const { appointmentId } = req.params;

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
  const { doctorId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find({ doctor: doctorId })
      .select("dateTime status")
      .skip(skip)
      .limit(limit);

    if (!appointments || appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron turnos para este médico." });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.log(error);
    return next(new HttpError("No se pudieron listar los turnos del médico.", 500));
  }
};


const listAppointmentsByPatient = async (req, res, next) => {
  const userId = req.userData.userId; 

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const skip = (page - 1) * limit;

    const appointments = await Appointment.find({ user: userId })
      .populate("doctor", "name")
      .select("dateTime status")
      .skip(skip)
      .limit(limit);

    if (!appointments || appointments.length === 0) {
      return res
        .status(404)
        .json({ message: "No se encontraron turnos para este paciente." });
    }

    res.status(200).json({ appointments });
  } catch (error) {
    console.log(error);
    return next(new HttpError("No se pudieron listar los turnos del paciente.", 500));
  }
};

const reserveAppointment = async (req, res, next) => {
  const { appointmentId } = req.params;

  try {
    // Verificar si el turno existe y está disponible para reserva
    const existingAppointment = await Appointment.findOne({
      _id: appointmentId,
      status: "available",
    });

    if (!existingAppointment) {
      return res
        .status(404)
        .json({ message: "El turno no está disponible para reserva." });
    }

    // Actualizar el turno reservándolo para el usuario
    existingAppointment.status = "reserved";
    existingAppointment.user = req.userData.userId;

    await existingAppointment.save();

    res.status(200).json({ message: "Turno reservado con exito." });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "No se pudo reservar el turno existente." });
  }
};

const cancelAppointment = async (req, res, next) => {
  const { appointmentId } = req.params;

  try {
    // Buscar el turno por ID
    const existingAppointment = await Appointment.findOne({
      _id: appointmentId,
      user: req.userData.userId,
      status: "reserved",
    });

    if (!existingAppointment) {
      return res
        .status(404)
        .json({ message: "El turno no está disponible para cancelar." });
    }

    // Actualizar el estado del turno a 'canceled'
    existingAppointment.status = "canceled";

    await existingAppointment.save();

    res.status(200).json({ message: "Turno cancelado con exito." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "No se pudo cancelar el turno." });
  }
};

const getCanceledAppointmentsByUser = async (req, res, next) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const skip = (page - 1) * limit;

    // Buscar todos los turnos cancelados por el usuario con paginación
    const canceledAppointments = await Appointment.find({
      user: userId,
      status: "canceled",
    })
    .skip(skip)
    .limit(limit);

    res.status(200).json({ canceledAppointments });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error al obtener el historial de cancelaciones." });
  }
};

module.exports = {
  createAppointment,
  updateAppointment,
  deleteAppointment,
  listAppointmentsByDoctor,
  listAppointmentsByPatient,
  reserveAppointment,
  cancelAppointment,
  getCanceledAppointmentsByUser,
};
