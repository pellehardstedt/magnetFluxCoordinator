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

function moveToPlex(torrent, type) {
  const destDir = getDestinationPath(torrent, type);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  torrent.files.forEach(file => {
    if (isMediaOrSubtitle(file.name)) {
      const src = file.path; // Use absolute path from WebTorrent
      const dest = path.join(destDir, file.name);
      fs.renameSync(src, dest);
      console.log(`Moved ${src} to ${dest}`);
    } else {
      console.log(`Skipped non-media file: ${file.name}`);
    }
  });
}

export default { triggerScan, moveToPlex };