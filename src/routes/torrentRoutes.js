import express from 'express';
import { addTorrent, listTorrents } from '../controllers/torrentController.js';
import { requireAuth } from '../utils/authMiddleware.js';

const router = express.Router();

router.post('/add', requireAuth, addTorrent);
router.get('/list', requireAuth, listTorrents);

export default router;
