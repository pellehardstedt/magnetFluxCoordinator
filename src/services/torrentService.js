// filepath: services/torrentService.js
const WebTorrent = require('webtorrent');
const path = require('path');
const EventEmitter = require('events');
const client = new WebTorrent();
const downloads = [];
const emitter = new EventEmitter();

const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || path.join(__dirname, '..', 'downloads');

function addTorrent(torrentId) {
  return new Promise((resolve, reject) => {
    client.add(torrentId, { path: DOWNLOAD_PATH }, torrent => {
      downloads.push(torrent);
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

module.exports = {
  addTorrent,
  listTorrents,
  emitter,
};