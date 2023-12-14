const express = require("express");
const { check } = require("express-validator");

const router = express.Router();
const doctorController = require("../controllers/doctor-controller");
const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/checkAdmin");

// Ruta para agregar un nuevo médico (solo disponible como admin)
router.post(
  "/",
  checkAuth,
  checkAdmin,
  [check("name").not().isEmpty(), check("specialty").not().isEmpty()],
  doctorController.createDoctor
);

// Ruta para actualizar información de un médico (solo disponible como admin)
router.patch(
  "/:doctorId",
  checkAuth,
  checkAdmin,
  doctorController.updateDoctor
);

// Ruta para obtener todos los médicos registrados
router.get("/", doctorController.getAllDoctors);


module.exports = router;
