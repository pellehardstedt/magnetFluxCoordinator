import axios from 'axios';
import fs from 'fs';
import path from 'path';

const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PLEX_HOST = process.env.PLEX_HOST || 'localhost';
const PLEX_PORT = process.env.PLEX_PORT || 32400;
const PLEX_LIBRARY_PATH = process.env.PLEX_LIBRARY_PATH;
const ENABLE_PLEX_SCAN = process.env.ENABLE_PLEX_SCAN === 'true';

async function triggerScan() {
  if (!ENABLE_PLEX_SCAN) {
    console.log('Plex scan skipped due to configuration.');
    return;
  }

  const urls = [
    `http://${PLEX_HOST}:${PLEX_PORT}/library/sections/1/refresh?X-Plex-Token=${PLEX_TOKEN}`,
    `http://${PLEX_HOST}:${PLEX_PORT}/library/sections/2/refresh?X-Plex-Token=${PLEX_TOKEN}`
  ];
  await Promise.all(urls.map(url =>
    axios.get(url, {
      headers: {
        'X-Plex-Client-Identifier': 'magnetFluxCoordinator'
      }
    })
  ));
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