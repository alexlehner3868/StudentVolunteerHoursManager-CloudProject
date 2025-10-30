const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const { registerUser } = require('../controllers/registerController');

router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/password-reset', loginController.passwordReset);
router.post("/register", registerUser);
module.exports = router;