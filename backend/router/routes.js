const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const { registerUser } = require('../controllers/registerController');
const { addStudentInfo } = require("../controllers/studentController");
const { addGuidanceInfo } = require("../controllers/guidanceController");
const { checkEmail } = require('../controllers/checkEmailController');

router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/password-reset', loginController.passwordReset);
router.post('/check-email', checkEmail);
router.post("/register", registerUser);
router.post("/student-info", addStudentInfo);
router.post("/guidance-info", addGuidanceInfo);
module.exports = router;