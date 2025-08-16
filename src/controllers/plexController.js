import axios from 'axios';
import fs from 'fs';
import path from 'path';

const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PLEX_HOST = process.env.PLEX_HOST || 'localhost';
const PLEX_PORT = process.env.PLEX_PORT || 32400;

console.log('Using Plex token:', PLEX_TOKEN);

// Scan both Movies and TV Shows sections
export async function scanLibrary(req, res) {
  try {
    const urls = [
      `http://${PLEX_HOST}:${PLEX_PORT}/library/sections/1/refresh?X-Plex-Token=${PLEX_TOKEN}`,
      `http://${PLEX_HOST}:${PLEX_PORT}/library/sections/2/refresh?X-Plex-Token=${PLEX_TOKEN}`
    ];
    await Promise.all(urls.map(url => axios.get(url)));
    res.json({ success: true });
  } catch (err) {
    console.error('Plex scan error:', err.response?.status, err.response?.data);
    res.status(500).json({ success: false, message: err.message, details: err.response?.data });
  }
}

export async function getLibraries(req, res) {
  try {
    const url = `http://${PLEX_HOST}:${PLEX_PORT}/library/sections?X-Plex-Token=${PLEX_TOKEN}`;
    const response = await axios.get(url);
    res.type('application/xml').send(response.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

export async function getRecentlyAdded(req, res) {
  try {
    const url = `http://${PLEX_HOST}:${PLEX_PORT}/library/recentlyAdded?X-Plex-Token=${PLEX_TOKEN}`;
    const response = await axios.get(url);
    res.type('application/xml').send(response.data);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

function moveToPlex(torrent, type) {
  const destDir = getDestinationPath(torrent, type);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  torrent.files.forEach(file => {
    if (isMediaOrSubtitle(file.name)) {
      const src = file.path; // This should be the absolute path
      const dest = path.join(destDir, file.name);
      fs.renameSync(src, dest);
      console.log(`Moved ${src} to ${dest}`);
    } else {
      console.log(`Skipped non-media file: ${file.name}`);
    }
  });
}