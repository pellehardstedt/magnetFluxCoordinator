import axios from 'axios';

const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PLEX_HOST = process.env.PLEX_HOST || 'localhost';
const PLEX_PORT = process.env.PLEX_PORT || 32400;

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