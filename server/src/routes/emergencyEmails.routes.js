const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const emergencyEmailsController = require('../controllers/emergencyEmails.controller');

router.get('/', authenticateToken, emergencyEmailsController.getEmails);
router.post('/', authenticateToken, emergencyEmailsController.addEmail);
router.delete('/:id', authenticateToken, emergencyEmailsController.deleteEmail);

module.exports = router;
