const express = require("express");
const { check } = require("express-validator");

const router = express.Router();
const doctorController = require("../controllers/doctor-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/checkRole");

router.use(checkAuth);
// Ruta para agregar un nuevo médico (ADMINISTRADOR)
router.post(
  "/",
  checkRole("admin"),
  [
    check("name").not().isEmpty().withMessage("El nombre no puede estar vacio"),
    check("specialty")
      .not()
      .isEmpty()
      .withMessage("La especialidad no puede estar vacio"),
  ],
  doctorController.createDoctor
);

// Ruta para actualizar información de un médico (ADMINISTRADOR)
router.patch(
  "/:doctorId",
  checkRole("admin"),
  [
    check("name")
      .optional()
      .not()
      .isEmpty()
      .withMessage("El campo name no puede estar vacio"),
    check("specialty")
      .optional()
      .not()
      .isEmpty()
      .withMessage("La especialidad no puede estar vacio"),
  ],
  doctorController.updateDoctor
);

// Ruta para obtener todos los médicos registrados
router.get("/", doctorController.getAllDoctors);

// Ruta para obtener detalles de un médico y sus turnos disponibles
router.get("/:doctorId", doctorController.getDoctorDetails);

module.exports = router;
