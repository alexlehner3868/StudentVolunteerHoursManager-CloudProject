const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const counsellorController = require('../controllers/CounsellorController');
const { registerUser } = require('../controllers/registerController');
const { addStudentInfo } = require("../controllers/studentController");
const { addGuidanceInfo } = require("../controllers/guidanceController");
const { checkEmail } = require('../controllers/checkEmailController');
const { getSystemMetrics } = require("../controllers/metricsController");
const volunteerHourSubmissionController = require('../controllers/volunteerHourSubmissionController');
const studentController = require('../controllers/studentInfoController');
const guidanceCounsellorController = require('../controllers/guidanceCounsellorController');
const adminController = require('../controllers/adminController');

// Login  
router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/password-reset', loginController.passwordReset);

// Registration 
router.post('/check-email', checkEmail);
router.post("/register", registerUser);
router.post("/student-info", addStudentInfo);
router.post("/guidance-info", addGuidanceInfo);

// Monitoring
router.get("/system-metrics", getSystemMetrics);

// Guidance Counsellor Reviewing Submissions
router.get('/submissions', counsellorController.getSubmissions);
router.put('/update-submission', counsellorController.updateSubmission);

// Student - Volunteer Hour Submissions
router.post('/volunteer-hours/submit', volunteerHourSubmissionController.submitHours);
router.delete('/volunteer-hours/delete', volunteerHourSubmissionController.deleteSubmission);
router.put("/student/:studentId/submissions/:submissionId", volunteerHourSubmissionController.updateSubmission);

// Student - Dashboard
router.get('/volunteer-hours/:studentId', studentController.getMonthlyHours);
router.get('/student/:studentId/submissions', studentController.getStudentSubmissions);
router.get('/volunteer-summary/:studentId', studentController.getSummary);
router.get('/student-name/:studentId', studentController.getStudentName);

// Student - Profile Info 
router.get('/student/:studentId/profile', studentController.getProfile);
router.put('/student/:studentId/profile', studentController.updateGraduationDate);
router.get('/student/:studentId/guidance-counsellors', guidanceCounsellorController.getCounsellorsAtStudentSchool);

// Guidance Counsellor - Profile Info
router.get('/gc/:gcId/profile', guidanceCounsellorController.getProfile);
router.get('/counsellor-students', guidanceCounsellorController.getStudentsAtCounsellorSchool);

// Admin
router.post('/admin/create-user', adminController.createUser);

module.exports = router;
