import express from 'express';
import { scanLibrary } from '../controllers/plexController.js';
import { requireAuth } from '../utils/authMiddleware.js';

const router = express.Router();

router.post('/scan', requireAuth, scanLibrary);

export default router;