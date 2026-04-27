const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.loginEmployee);
router.post('/register/client', authController.registerClient);
router.post('/login/client', authController.loginClient);

module.exports = router;
