const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");
const Doctor = require("../models/doctor");
const Specialty = require("../models/specialty");

const createDoctor = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(422).json({ errors: errorMessages });
  }

  const { name, specialty } = req.body;

  try {
    const existingDoctor = await Doctor.findOne({ name });

    if (existingDoctor) {
      return next(new HttpError("El médico ya existe en el sistema", 422));
    }

    const existingSpecialty = await Specialty.findById(specialty);

    if (!existingSpecialty) {
      return next(
        new HttpError("La especialidad especificada no existe.", 404)
      );
    }

    const newDoctor = new Doctor({
      name,
      specialty,
      appointments: [],
    });

    await newDoctor.save();
    res.status(201).json({ message: "El doctor fue creado con éxito" });
  } catch (error) {
    return next(
      new HttpError("No se pudo crear al médico, inténtalo de nuevo", 500)
    );
  }
};

const updateDoctor = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(422).json({ errors: errorMessages });
  }

  const doctorId = req.params.doctorId;
  const { name, specialty } = req.body;

  try {
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return next(
        new HttpError("No se encontró al médico proporcionado", 404)
      );
    }

    doctor.name = name || doctor.name; 

    if (specialty) {
      const existingSpecialty = await Specialty.findById(specialty);
      if (!existingSpecialty) {
        return next(
          new HttpError("La especialidad especificada no existe.", 404)
        );
      }
      console.log(specialty)
      doctor.specialty = specialty; 
    }

    await doctor.save();
    res
      .status(200)
      .json({ message: "El doctor fue actualizado con éxito" });
  } catch (error) {
    console.log(error)
    return next(
      
      new HttpError("No se pudo actualizar al médico, inténtalo de nuevo", 500)
    );
  }
};

const getAllDoctors = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const skip = (page - 1) * limit;

    const doctors = await Doctor.find()
      .populate("specialty", "name")
      .skip(skip)
      .limit(limit);

    res.status(200).json({ doctors });
  } catch (error) {
    return next(new HttpError("No se pudo obtener la lista de médicos", 500));
  }
};

const getDoctorDetails = async (req, res, next) => {
  const doctorId = req.params.doctorId;

  try {
    const doctor = await Doctor.findById(doctorId)
      .populate("specialty", "name")
      .populate({
        path: "appointments",
        match: { status: "available" },
        select: "dateTime status", // Seleccionar campos necesarios
      });

    if (!doctor) {
      return next(new HttpError("El médico no se encontró en el sistema", 404));
    }

    res.status(200).json({ doctor: doctor });
  } catch (error) {
    console.log(error);
    return next(new HttpError("No se pudo obtener el detalle del médico", 500));
  }
};

module.exports = {
  createDoctor,
  updateDoctor,
  getAllDoctors,
  getDoctorDetails,
};
