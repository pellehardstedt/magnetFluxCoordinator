// filepath: routes/plexRoutes.js
const express = require('express');
const router = express.Router();
const plexController = require('../controllers/plexController');
const { requireAuth } = require('../utils/authMiddleware');

router.post('/scan', requireAuth, plexController.scanLibrary);

module.exports = router;