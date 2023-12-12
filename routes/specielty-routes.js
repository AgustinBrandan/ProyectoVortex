const express = require('express');
const { check } = require('express-validator');

const specialtyController = require('../controllers/specialty-controller');
const checkAuth = require('../middleware/check-auth');
const checkAdmin = require('../middleware/checkAdmin');

const router = express.Router();

router.get('/', checkAuth, specialtyController.getSpecialties);

router.post(
  '/',
  checkAuth,
  checkAdmin, 
  [
    check('name').not().isEmpty(),
    check('description').not().isEmpty(),
  ],
  specialtyController.createSpecialty
);

module.exports = router;
