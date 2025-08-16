import axios from 'axios';

const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PLEX_HOST = process.env.PLEX_HOST || 'localhost';
const PLEX_PORT = process.env.PLEX_PORT || 32400;

export async function scanLibrary(req, res) {
  try {
    const url = `http://${PLEX_HOST}:${PLEX_PORT}/library/sections/all/refresh?X-Plex-Token=${PLEX_TOKEN}`;
    await axios.get(url);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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