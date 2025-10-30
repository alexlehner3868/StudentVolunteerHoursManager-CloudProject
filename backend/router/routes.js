const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const volunteerHourSubmissionController = require('../controllers/volunteerHourSubmissionController');

router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/password-reset', loginController.passwordReset);

router.post('/volunteer-hours/submit', volunteerHourSubmissionController.submitHours);


module.exports = router;