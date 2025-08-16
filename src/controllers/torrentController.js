import torrentService from '../services/torrentService.js';
import urlExtractor from '../utils/urlExtractor.js';

function suggestType(torrentNameOrUrl) {
  // If SxxExx pattern exists, it's likely a TV series
  if (/S\d{1,2}E\d{1,2}/i.test(torrentNameOrUrl)) return 'tv';
  return 'movie';
}

export async function addTorrent(req, res) {
  const { url, type } = req.body;
  try {
    const torrentUrl = await urlExtractor.extract(url);
    // Suggest type if not provided
    const detectedType = type || suggestType(torrentUrl);
    const torrent = await torrentService.addTorrent(torrentUrl, detectedType);
    res.json({ success: true, torrent, suggestedType: detectedType });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
}

export function listTorrents(req, res) {
  res.json({ torrents: torrentService.listTorrents() });
}