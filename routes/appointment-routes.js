const express = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/checkRole");

const appointmentController = require("../controllers/appointment-controller");
const router = express.Router();

router.use(checkAuth);
// Crear un turno (ADMINISTRADOR)
router.post(
  "/",
  checkRole("admin"),
  [
    check("doctorId").not().isEmpty().withMessage("Doctor no puede ser vacio"),
    check("dateTime")
      .isISO8601()
      .toDate()
      .withMessage("Ingrese fecha y hora en formato YYYY-MM-DDTHH:MM:SS.000Z"),
  ],
  appointmentController.createAppointment
);
// Actualizar turno (ADMINISTRADOR)
router.patch(
  "/:appointmentId",
  checkRole("admin"),
  [
    check("dateTime")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Ingrese fecha y hora en formato YYYY-MM-DDTHH:MM:SS.000Z"),
    check("status")
      .optional()
      .isIn(["available", "confirmed", "canceled"])
      .withMessage("El estado debe ser 'available', 'confirmed' o 'canceled'"),
    check("user")
      .optional()
      .isString()
      .notEmpty()
      .withMessage("Usuario no puede ser vacio"),
  ],
  appointmentController.updateAppointment
);

// Eliminar un turno por su ID (ADMINISTRADOR)
router.delete(
  "/:appointmentId",
  checkRole("admin"),
  appointmentController.deleteAppointment
);

// Mostrar turnos del medico (ADMINISTRADOR)
router.get(
  "/doctor/:doctorId",
  checkRole("admin"),
  appointmentController.listAppointmentsByDoctor
);

// ENDPOINT SOLO PARA PACIENTES

// Mostrar Turnos del paciente
router.get(
  "/patient/:userId",
  checkRole("user"),
  appointmentController.listAppointmentsByPatient
);
// Reservar un turno
router.patch(
  "/reservar/:appointmentId",
  checkRole("user"),
  appointmentController.reserveAppointment
);
// Cancelar turno
router.patch(
  "/cancelar/:appointmentId",
  checkRole("user"),
  appointmentController.cancelAppointment
);

router.get(
  "/cancelaciones/:userId",
  appointmentController.getCanceledAppointmentsByUser
);

module.exports = router;
