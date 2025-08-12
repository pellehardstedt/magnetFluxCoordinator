// filepath: controllers/plexController.js
const plexService = require('../services/plexService');

exports.scanLibrary = async (req, res) => {
  try {
    await plexService.triggerScan();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};