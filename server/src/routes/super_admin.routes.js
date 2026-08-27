const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/super_admin.controller');
const authenticateToken = require('../middleware/auth');

router.get('/stats', authenticateToken, superAdminController.getStats);
router.get('/organizations', authenticateToken, superAdminController.getOrganizations);
router.get('/organizations/:id', authenticateToken, superAdminController.getOrganizationById);
router.get('/users', authenticateToken, superAdminController.getUsers);
router.delete('/users/:id', authenticateToken, superAdminController.deleteUser);
router.put('/users/:id', authenticateToken, superAdminController.updateUser);
router.delete('/organizations/:id', authenticateToken, superAdminController.deleteOrganization);

module.exports = router;
