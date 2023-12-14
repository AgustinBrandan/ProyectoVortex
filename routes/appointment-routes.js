const express = require("express");
const { check } = require("express-validator");

const checkAuth = require("../middleware/check-auth");
const checkAdmin = require("../middleware/checkAdmin");

const appointmentController = require("../controllers/appointment-controller");
const router = express.Router();

router.post(
  "/",
  checkAuth,
  checkAdmin,
  [
    check("doctorId").not().isEmpty(),
    check("dateTime").isISO8601().toDate(),
  ],
  appointmentController.createAppointment
);

router.patch(
    "/:appointmentId",
    checkAuth,
    checkAdmin,
    [
      check("hour").optional().isString().notEmpty(),
      check("status").optional().isString().notEmpty(),
      check("user").optional().isString().notEmpty(),
    ],
    appointmentController.updateAppointment
  );
  

module.exports = router;
