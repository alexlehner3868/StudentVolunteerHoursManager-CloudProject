const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const volunteerHourSubmissionController = require('../controllers/volunteerHourSubmissionController');
const studentInfoController = require('../controllers/studentInfoController');


router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/password-reset', loginController.passwordReset);

router.post('/volunteer-hours/submit', volunteerHourSubmissionController.submitHours);

router.get('/volunteer-hours/:studentId', studentInfoController.getMonthlyHours);
router.get('/volunteer-summary/:studentId', studentInfoController.getSummary);
router.get('/api/student-name/:studentId', studentInfoController.getStudentName);

module.exports = router;