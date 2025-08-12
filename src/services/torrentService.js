import WebTorrent from 'webtorrent';
import path from 'path';
import { EventEmitter } from 'events';

const client = new WebTorrent();
const downloads = [];
const emitter = new EventEmitter();

const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || path.join(process.cwd(), 'downloads');

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

export default {
  addTorrent,
  listTorrents,
  emitter,
};