import WebTorrent from 'webtorrent';
import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs';

const client = new WebTorrent();
const downloads = [];
const emitter = new EventEmitter();

const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || path.join(process.cwd(), 'downloads');
const TORRENTS_FILE = path.join(process.cwd(), 'torrents.json');

// Load persisted torrents on startup
function loadPersistedTorrents() {
  let ids = [];
  if (fs.existsSync(TORRENTS_FILE)) {
    ids = JSON.parse(fs.readFileSync(TORRENTS_FILE, 'utf-8'));
    ids.forEach(id => addTorrent(id));
  }
  cleanupDownloadFolder(ids);
}

// Save current torrent IDs to file
function persistTorrents() {
  const ids = downloads.map(t => t.magnetURI || t.torrentFile);
  fs.writeFileSync(TORRENTS_FILE, JSON.stringify(ids, null, 2));
}

// Remove files in DOWNLOAD_PATH not associated with persisted torrents
function cleanupDownloadFolder(persistedIds) {
  if (!fs.existsSync(DOWNLOAD_PATH)) return;
  const files = fs.readdirSync(DOWNLOAD_PATH);
  // Get expected file/folder names from torrent infoHash or name
  const expectedNames = new Set();
  persistedIds.forEach(id => {
    // Try to extract infoHash from magnet URI
    const match = id.match(/btih:([A-Fa-f0-9]+)/);
    if (match) {
      expectedNames.add(match[1]);
    }
    // Also add torrent name if possible (for .torrent files)
    // You may want to improve this logic for your use case
  });

  files.forEach(file => {
    const filePath = path.join(DOWNLOAD_PATH, file);
    // Remove if not in expectedNames
    let shouldRemove = true;
    expectedNames.forEach(name => {
      if (file.includes(name)) {
        shouldRemove = false;
      }
    });
    if (shouldRemove) {
      fs.rmSync(filePath, { recursive: true, force: true });
      console.log(`Removed orphaned download: ${filePath}`);
    }
  });
}

function addTorrent(torrentId) {
  return new Promise((resolve, reject) => {
    client.add(torrentId, { path: DOWNLOAD_PATH }, torrent => {
      downloads.push(torrent);
      persistTorrents();
      torrent.on('done', () => {
        emitter.emit('done', torrent);
      });
      resolve({
        name: torrent.name,
        infoHash: torrent.infoHash,
        magnetURI: torrent.magnetURI,
      });
    }).on('error', reject);
  });
}

function listTorrents() {
  return downloads.map(t => ({
    name: t.name,
    progress: t.progress,
    done: t.done,
    infoHash: t.infoHash,
  }));
}

// On server startup, resume torrents and cleanup downloads
loadPersistedTorrents();

export default {
  addTorrent,
  listTorrents,
  emitter,
};