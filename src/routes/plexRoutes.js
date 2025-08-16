import express from 'express';
import { scanLibrary, getLibraries, getRecentlyAdded } from '../controllers/plexController.js';

const router = express.Router();

router.post('/scan', scanLibrary);
router.get('/libraries', getLibraries);
router.get('/recently-added', getRecentlyAdded);

export default router;