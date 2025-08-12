import plexService from '../services/plexService.js';

export async function scanLibrary(req, res) {
  try {
    await plexService.triggerScan();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}