const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

router.post('/register-organization', authController.registerOrganization);
router.post('/login', authController.login);
router.post('/super-admin-login', authController.superAdminLogin);
router.post('/join/:referralCode', authController.joinOrganization);
router.get('/me', authenticateToken, authController.getMe);
router.patch('/me', authenticateToken, authController.updateMe);
router.delete('/me', authenticateToken, authController.deleteMe);
router.post('/logout', authController.logout);

module.exports = router;
