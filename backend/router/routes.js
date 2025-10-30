const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const { registerUser } = require('../controllers/registerController');
const { addStudentInfo } = require("../controllers/studentController");
const { addGuidanceInfo } = require("../controllers/guidanceController");

router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/password-reset', loginController.passwordReset);
router.post("/register", registerUser);
router.post("/student-info", addStudentInfo);
router.post("/guidance-info", addGuidanceInfo);
module.exports = router;