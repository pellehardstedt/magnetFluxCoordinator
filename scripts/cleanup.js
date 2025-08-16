import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const DOWNLOAD_PATH = process.env.DOWNLOAD_PATH || path.join(process.cwd(), 'downloads');
const TORRENTS_FILE = path.join(process.cwd(), 'torrents.json');

// Remove all files and folders in the downloads directory
if (fs.existsSync(DOWNLOAD_PATH)) {
  fs.readdirSync(DOWNLOAD_PATH).forEach(file => {
    const curPath = path.join(DOWNLOAD_PATH, file);
    if (fs.lstatSync(curPath).isDirectory()) {
      fs.rmSync(curPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(curPath);
    }
  });
  console.log(`Cleaned downloads folder: ${DOWNLOAD_PATH}`);
} else {
  console.log(`Downloads folder does not exist: ${DOWNLOAD_PATH}`);
}

// Reset torrents.json
fs.writeFileSync(TORRENTS_FILE, JSON.stringify([], null, 2));
console.log(`Reset torrents file: ${TORRENTS_FILE}`);