const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/user-controller");
const checkAuth = require("../middleware/check-auth");
const checkRole = require("../middleware/checkRole");

const router = express.Router();

// Crear Usuario (ADMIN/USER)
router.post(
  "/signup",
  [
    check("name").not().isEmpty().withMessage("El nombre no puede estar vacío"),
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("El correo electrónico no es válido"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  usersController.signup
);

// Iniciar session
router.post(
  "/login",
  [
    check("email")
      .normalizeEmail()
      .isEmail()
      .withMessage("El correo electrónico no es válido"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  usersController.login
);

router.post("/send-email",usersController.sendRecoveryEmail)

router.post(
  '/reset-password',usersController.resetPassword)

router.use(checkAuth);

router.get("/", checkRole("admin"), usersController.getUsers);



module.exports = router;
