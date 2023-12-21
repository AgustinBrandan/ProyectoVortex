const { validationResult } = require("express-validator");
const HttpError = require("../models/http.error");
const Specialty = require("../models/specialty");

const createSpecialty = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(422).json({ errors: errorMessages });
  }

  const { name, description } = req.body;

  try {
    const existingSpecialty = await Specialty.findOne({ name });

    if (existingSpecialty) {
      return next(new HttpError("La especialidad ya existe", 422));
    }

    const newSpecialty = new Specialty({ name, description });
    await newSpecialty.save();

    res.status(201).json({ message: "Especialidad creada con éxito" });
  } catch (err) {
    return next(
      new HttpError("No se pudo crear la especialidad, inténtalo de nuevo", 500)
    );
  }
};

const getSpecialties = async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const skip = (page - 1) * limit;

    const specialties = await Specialty.find({})
      .skip(skip)
      .limit(limit);

    res.json({ specialties });
  } catch (error) {
    return next(new HttpError("No se pudo obtener las especialidades", 500));
  }
};

module.exports = {
  createSpecialty,
  getSpecialties,
};
