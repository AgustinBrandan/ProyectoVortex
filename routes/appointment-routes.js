const express = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/checkAdmin");

const appointmentController = require("../controllers/appointment-controller");
const router = express.Router();
// Crear un turno (ADMINISTRADOR)
router.post(
  "/",
  checkAuth,
  checkAdmin,
  [check("doctorId").not().isEmpty(), check("dateTime").isISO8601().toDate()],
  appointmentController.createAppointment
);
// Actualizar turno (ADMINISTRADOR)
router.patch(
  "/:appointmentId",
  checkAuth,
  checkAdmin,
  [
    check("dateTime").optional().isISO8601().toDate(),
    check("status").optional().isString().notEmpty(),
    check("user").optional().isString().notEmpty(),
  ],
  appointmentController.updateAppointment
);

// Eliminar un turno por su ID (ADMINISTRADOR)
router.delete(
  "/:appointmentId",
  checkAuth,
  checkAdmin,
  appointmentController.deleteAppointment
);

// Mostrar turnos del medico
router.get(
  "/doctor/:doctorId",
  checkAuth,
  checkAdmin,
  appointmentController.listAppointmentsByDoctor
);

router.get(
  "/patient/:userId",
  checkAuth,
  appointmentController.listAppointmentsByPatient
);

module.exports = router;
