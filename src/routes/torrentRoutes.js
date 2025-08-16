import express from 'express';
import { addTorrent, listTorrents } from '../controllers/torrentController.js';

const router = express.Router();

router.post('/add', addTorrent);
router.get('/list', listTorrents);

export default router;
