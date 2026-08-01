const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const orgController = require('../controllers/org.controller');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/members', authenticateToken, orgController.getMembers);
router.post('/users', authenticateToken, orgController.createUser);
router.patch('/users/:userId', authenticateToken, orgController.updateUser);
router.delete('/users/:userId', authenticateToken, orgController.deleteUser);

router.patch('/settings/details', authenticateToken, orgController.updateSettingsDetails);
router.patch('/settings/logo', authenticateToken, upload.single('logo'), orgController.updateSettingsLogo);

module.exports = router;
