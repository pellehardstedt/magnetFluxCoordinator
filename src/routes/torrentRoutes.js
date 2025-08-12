const express = require('express');
const router = express.Router();
const torrentController = require('../controllers/torrentController');
const { requireAuth } = require('../utils/authMiddleware');

router.post('/add', requireAuth, torrentController.addTorrent);
router.get('/list', requireAuth, torrentController.listTorrents);
