import axios from 'axios';
import fs from 'fs';
import path from 'path';

const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PLEX_HOST = process.env.PLEX_HOST || 'localhost';
const PLEX_PORT = process.env.PLEX_PORT || 32400;
const PLEX_LIBRARY_PATH = process.env.PLEX_LIBRARY_PATH;

async function triggerScan() {
  // Triggers a Plex library scan via HTTP API
  const url = `http://${PLEX_HOST}:${PLEX_PORT}/library/sections/all/refresh?X-Plex-Token=${PLEX_TOKEN}`;
  await axios.get(url);
}

function moveToPlex(filePath) {
  const dest = path.join(PLEX_LIBRARY_PATH, path.basename(filePath));
  fs.renameSync(filePath, dest);
  return dest;
}

export default { triggerScan, moveToPlex };