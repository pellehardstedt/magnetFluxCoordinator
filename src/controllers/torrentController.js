import torrentService from '../services/torrentService.js';
import urlExtractor from '../utils/urlExtractor.js';

export async function addTorrent(req, res) {
  const { url } = req.body;
  try {
    const torrentUrl = await urlExtractor.extract(url);
    const torrent = await torrentService.addTorrent(torrentUrl);
    res.json({ success: true, torrent });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export function listTorrents(req, res) {
  res.json({ torrents: torrentService.listTorrents() });
}