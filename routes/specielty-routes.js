const express = require("express");
const { check } = require("express-validator");

const specialtyController = require("../controllers/specialty-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

router.use(checkAuth);

// Ruta para mostrar todas las especialidades
router.get("/", specialtyController.getSpecialties);

// Ruta para agregar una nueva Especialidad (ADMINISTRADOR)
router.post(
  "/",
  checkRole("admin"),
  [
    check("name").not().isEmpty().withMessage("El nombre no puede estar vacío"),
    check("description")
      .not()
      .isEmpty()
      .withMessage("La descripcion no puede estar vacia"),
  ],
  specialtyController.createSpecialty
);

module.exports = router;
