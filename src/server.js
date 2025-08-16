import dotenv from 'dotenv';
dotenv.config();

// Now import other modules
import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

import torrentRoutes from './routes/torrentRoutes.js';
import plexRoutes from './routes/plexRoutes.js';
import authRoutes from './routes/authRoutes.js';
import plexService from './services/plexService.js';
import fileUtils from './utils/fileUtils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false,
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', authRoutes);
app.use('/api/torrents', torrentRoutes);
app.use('/api/plex', plexRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Usage:
// await plexService.triggerScan();
// plexService.moveToPlex(torrent, type);