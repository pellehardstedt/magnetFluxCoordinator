import WebTorrent from 'webtorrent';
import path from 'path';
import { EventEmitter } from 'events';
import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import plexService from './plexService.js';
dotenv.config();


const client = new WebTorrent();
const downloads = [];
const emitter = new EventEmitter();

const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || path.join(process.cwd(), 'downloads');
const TORRENTS_FILE = path.join(process.cwd(), 'torrents.json');

// Add this after your other imports
const SPEED_HISTORY_INTERVAL = 2000; // ms
const SPEED_HISTORY_LENGTH = 60; // 2 minutes (60 * 2s = 120s)

const speedHistoryMap = new Map(); // infoHash -> [{timestamp, speed}]

// Load persisted torrents on startup
function loadPersistedTorrents() {
  let items = [];
  if (fs.existsSync(TORRENTS_FILE)) {
    items = JSON.parse(fs.readFileSync(TORRENTS_FILE, 'utf-8'));
    items.forEach(item => addTorrent(item.id, item.type));
  }
  cleanupDownloadFolder(items.map(item => item.id));
}

// Save current torrent IDs to file
function persistTorrents() {
  const ids = downloads.map(t => ({
    id: t.magnetURI || t.torrentFile,
    type: t.type || 'movie'
  }));
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

function parseTvInfo(torrentName) {
  // Example: "South.Park.S27E01.1080p.WEB.H264-SuccessfulCrab"
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
      // Example: /plexmediaserver/Library/tvseries/South Park/Season 27/
      return path.join(process.env.PLEX_LIBRARY_PATH, 'tvseries', info.title, `Season ${info.season}`);
    }
    // Fallback if parsing fails
    return path.join(process.env.PLEX_LIBRARY_PATH, 'tvseries', torrent.name);
  } else {
    // Movie: /plexmediaserver/Library/video/
    return path.join(process.env.PLEX_LIBRARY_PATH, 'video');
  }
}

function isMediaOrSubtitle(filename) {
  // Accept common video and subtitle extensions
  return /\.(mp4|mkv|avi|mov|wmv|flv|webm|srt)$/i.test(filename);
}

function moveToPlex(torrent, type) {
  const destDir = getDestinationPath(torrent, type);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

  torrent.files.forEach(file => {
    if (isMediaOrSubtitle(file.name)) {
      // Ensure we use the absolute path for the source file
      const src = path.isAbsolute(file.path)
        ? file.path
        : path.join(process.env.DOWNLOAD_PATH || path.join(process.cwd(), 'downloads'), file.path);

      const dest = path.join(destDir, file.name);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      console.log('Checking file path:', src);
      if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`Moved ${src} to ${dest}`);
      } else {
        console.warn(`Source file does not exist, skipping: ${src}`);
      }
    } else {
      console.log(`Skipped non-media file: ${file.name}`);
    }
  });
}

async function checkInRecentlyAdded(torrentName) {
  const PLEX_TOKEN = process.env.PLEX_TOKEN;
  const PLEX_HOST = process.env.PLEX_HOST || 'localhost';
  const PLEX_PORT = process.env.PLEX_PORT || 32400;
  const url = `http://${PLEX_HOST}:${PLEX_PORT}/library/recentlyAdded?X-Plex-Token=${PLEX_TOKEN}`;
  try {
    const response = await axios.get(url);
    // Simple string check for the torrent name in the XML response
    return response.data.includes(torrentName);
  } catch (err) {
    console.error('Error checking Plex recently added:', err.message);
    return false;
  }
}

function moveToPlexAndScan(torrent, type) {
  moveToPlex(torrent, type);
  // Scan Plex library
  plexService.triggerScan().then(async () => {
    // Wait a few seconds for Plex to update
    setTimeout(async () => {
      const found = await checkInRecentlyAdded(torrent.name);
      if (found) {
        console.log(`✅ "${torrent.name}" found in Plex recently added!`);
      } else {
        console.warn(`⚠️ "${torrent.name}" NOT found in Plex recently added.`);
      }
    }, 5000); // Wait 5 seconds before checking
  });
}

// Track download speed of torrents
function trackSpeed(torrent) {
  if (!speedHistoryMap.has(torrent.infoHash)) {
    speedHistoryMap.set(torrent.infoHash, []);
  }
  setInterval(() => {
    const now = Date.now();
    const speed = torrent.downloadSpeed; // bytes/sec
    const history = speedHistoryMap.get(torrent.infoHash);
    history.push({ timestamp: now, speed });
    // Keep only last 2 minutes
    while (history.length > SPEED_HISTORY_LENGTH) {
      history.shift();
    }
    speedHistoryMap.set(torrent.infoHash, history);
  }, SPEED_HISTORY_INTERVAL);
}

function getCurrentSpeed(infoHash) {
  const history = speedHistoryMap.get(infoHash);
  if (history && history.length > 0) {
    return history[history.length - 1].speed;
  }
  return 0;
}

function getAverageSpeed(infoHash) {
  const history = speedHistoryMap.get(infoHash);
  if (history && history.length > 0) {
    const sum = history.reduce((acc, entry) => acc + entry.speed, 0);
    return Math.round(sum / history.length);
  }
  return 0;
}

// Update addTorrent to use moveToPlexAndScan
function addTorrent(torrentId, type = 'movie') {
  return new Promise((resolve, reject) => {
    client.add(torrentId, { path: DOWNLOAD_PATH }, torrent => {
      torrent.type = type; // Attach type for persistence
      downloads.push(torrent);
      persistTorrents();
      trackSpeed(torrent);
      torrent.on('done', () => {
        setTimeout(() => {
          moveToPlexAndScan(torrent, type);
          emitter.emit('done', torrent);
        }, 1000); // 1 second delay
      });
      resolve({
        name: torrent.name,
        infoHash: torrent.infoHash,
        magnetURI: torrent.magnetURI,
      });
    }).on('error', reject);
  });
}

// Update listTorrents to include speed info
function listTorrents() {
  return downloads.map(t => ({
    name: t.name,
    progress: t.progress,
    done: t.done,
    infoHash: t.infoHash,
    currentSpeed: getCurrentSpeed(t.infoHash), // bytes/sec
    averageSpeed: getAverageSpeed(t.infoHash), // bytes/sec
  }));
}

// On server startup, resume torrents and cleanup downloads
loadPersistedTorrents();

function sanitizeFolderName(name) {
  return name
    .replace(/[._]+/g, ' ')
    .replace(/[\[\]\(\)\{\}]/g, '')
    .replace(/[^a-zA-Z0-9\s\-]/g, '') // keep alphanumeric, space, dash
    .trim();
}

export default {
  addTorrent,
  listTorrents,
  emitter,
};