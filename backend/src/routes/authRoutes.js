const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/authMiddleware');

router.post('/parent/register', authController.registerParentHandler);
router.post('/parent/login', authController.loginParentHandler);
router.post('/parent/forgot-password', authController.forgotPasswordHandler);
router.post('/parent/reset-password-otp', authController.resetPasswordWithOtpHandler);
router.post('/child/login', authController.loginChildHandler);
router.post('/admin/login', authController.loginAdminHandler);
router.post('/logout', authenticate, authController.logoutHandler);
router.get('/me', authenticate, authController.meHandler);

module.exports = router;
