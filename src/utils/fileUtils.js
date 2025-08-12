import fs from 'fs';
import path from 'path';

export function moveFile(source, destination) {
    const fileName = path.basename(source);
    const destPath = path.join(destination, fileName);

    fs.rename(source, destPath, (err) => {
        if (err) {
            console.error(`Error moving file from ${source} to ${destPath}:`, err);
            throw err;
        }
        console.log(`File moved from ${source} to ${destPath}`);
    });
}