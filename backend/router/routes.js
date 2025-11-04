const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');
const counsellorController = require('../controllers/CounsellorController');

router.post('/login', loginController.login);
router.post('/forgot-password', loginController.forgotPassword);
router.post('/password-reset', loginController.passwordReset);

router.get('/submissions', counsellorController.getSubmissions);
router.put('/update-submission', counsellorController.updateSubmission);

module.exports = router;