const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const volunteerHourSubmissionController = require('../controllers/volunteerHourSubmissionController');
const studentController = require('../controllers/studentInfoController');
const guidanceCounsellorController = require('../controllers/guidanceCounsellorController');

router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/password-reset', loginController.passwordReset);

router.post('/volunteer-hours/submit', volunteerHourSubmissionController.submitHours);

router.get('/volunteer-hours/:studentId', studentController.getMonthlyHours);
router.get('/volunteer-summary/:studentId', studentController.getSummary);
router.get('/student-name/:studentId', studentController.getStudentName);
router.get('/student/:studentId/profile', studentController.getProfile);
router.put('/student/:studentId/profile', studentController.updateGraduationDate);

router.get('/gc/:gcId/profile', guidanceCounsellorController.getProfile);
router.get('/student/:studentId/guidance-counsellors', guidanceCounsellorController.getCounsellorsAtStudentSchool);


module.exports = router;
