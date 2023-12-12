const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/user-controller");
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

router.get("/", checkAuth, checkAdmin, usersController.getUsers);

router.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);

router.post("/login", usersController.login);

module.exports = router;