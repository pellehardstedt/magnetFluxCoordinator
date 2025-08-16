import express from 'express';
import { scanLibrary } from '../controllers/plexController.js';

const router = express.Router();

router.post('/scan', scanLibrary);

export default router;