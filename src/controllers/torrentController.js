// filepath: controllers/torrentController.js
const torrentService = require('../services/torrentService');
const urlExtractor = require('../utils/urlExtractor');

exports.addTorrent = async (req, res) => {
  const { url } = req.body;
  try {
    const torrentUrl = await urlExtractor.extract(url);
    const torrent = await torrentService.addTorrent(torrentUrl);
    res.json({ success: true, torrent });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.listTorrents = (req, res) => {
  res.json({ torrents: torrentService.listTorrents() });
};