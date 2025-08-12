// filepath: utils/urlExtractor.js
const axios = require('axios');
const cheerio = require('cheerio');

async function extract(url) {
  // If it's a magnet link or .torrent file, return as is
  if (url.startsWith('magnet:') || url.endsWith('.torrent')) {
    return url;
  }
  // Otherwise, try to extract magnet/torrent from the page
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const magnet = $('a[href^="magnet:"]').attr('href');
  if (magnet) return magnet;
  const torrent = $('a[href$=".torrent"]').attr('href');
  if (torrent) return torrent.startsWith('http') ? torrent : new URL(torrent, url).href;
  throw new Error('No magnet or torrent link found on page');
}

module.exports = { extract };