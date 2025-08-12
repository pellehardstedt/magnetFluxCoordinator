exports.moveFile = (source, destination) => {
    const fs = require('fs');
    const path = require('path');

    const fileName = path.basename(source);
    const destPath = path.join(destination, fileName);

    fs.rename(source, destPath, (err) => {
        if (err) {
            console.error(`Error moving file from ${source} to ${destPath}:`, err);
            throw err;
        }
        console.log(`File moved from ${source} to ${destPath}`);
    });
};