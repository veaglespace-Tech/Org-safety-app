const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const sosController = require('../controllers/sos.controller');

router.post('/trigger', authenticateToken, sosController.triggerSOS);
router.post('/update', authenticateToken, sosController.updateSOS);
router.post('/stop', authenticateToken, sosController.stopSOS);

module.exports = router;
