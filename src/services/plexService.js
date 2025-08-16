import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const PLEX_TOKEN = process.env.PLEX_TOKEN;
const PLEX_HOST = process.env.PLEX_HOST || 'localhost';
const PLEX_PORT = process.env.PLEX_PORT || 32400;
const PLEX_LIBRARY_PATH = process.env.PLEX_LIBRARY_PATH;
const ENABLE_PLEX_SCAN = process.env.ENABLE_PLEX_SCAN === 'true';
const TORRENTS_FILE = path.join(process.cwd(), 'torrents.json');

// Helper functions
function isMediaOrSubtitle(filename) {
  return /\.(mp4|mkv|avi|mov|wmv|flv|webm|srt)$/i.test(filename);
}

function parseTvInfo(torrentName) {
  const regex = /^(.*?)\.S(\d{1,2})E(\d{1,2})/i;
  const match = torrentName.replace(/ /g, '.').match(regex);
  if (match) {
    const title = match[1].replace(/\./g, ' ');
    const season = parseInt(match[2], 10);
    return { title, season };
  }
  return null;
}

function getDestinationPath(torrent, type) {
  if (type === 'tv') {
    const info = parseTvInfo(torrent.name);
    if (info) {
      return path.join(PLEX_LIBRARY_PATH, 'tvseries', info.title, `Season ${info.season}`);
    }
    return path.join(PLEX_LIBRARY_PATH, 'tvseries', torrent.name);
  } else {
    return path.join(PLEX_LIBRARY_PATH, 'video');
  }
}

// Persist torrents with type
function persistTorrents(downloads) {
  const data = downloads.map(t => ({
    id: t.magnetURI || t.torrentFile,
    type: t.type || 'movie'
  }));
  fs.writeFileSync(TORRENTS_FILE, JSON.stringify(data, null, 2));
}

// Load persisted torrents with type
function loadPersistedTorrents(addTorrent) {
  if (fs.existsSync(TORRENTS_FILE)) {
    const items = JSON.parse(fs.readFileSync(TORRENTS_FILE, 'utf-8'));
    items.forEach(item => addTorrent(item.id, item.type));
  }
}

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
      const dest = path.join(destDir, file.name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      console.log('Checking file path:', file.path);
      fs.renameSync(file.path, dest);
      console.log(`Moved ${file.path} to ${dest}`);
    } else {
      console.log(`Skipped non-media file: ${file.name}`);
    }
  });
}

export default { triggerScan, moveToPlex, persistTorrents, loadPersistedTorrents };