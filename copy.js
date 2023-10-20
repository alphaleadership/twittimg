const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const { promisify } = require('util');

const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const copyFileAsync = promisify(fs.copyFile);

async function copyMediaWithId(sourceDir, destinationDir) {
  const files = await readdirAsync(sourceDir);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const stats = await statAsync(sourcePath);

    if (stats.isFile()) {
      // Get the MIME type and extension
      const mimeType = mime.lookup(sourcePath);
      const extension = mime.extension(mimeType) || '.bin';

      // Generate a unique ID for the file (you can use any ID generation logic here)
      const fileId = Math.floor(Math.random() * 100000000); // Using a simple random number for demonstration purposes
	console.log(fileId)
      // Combine the ID with the new destination path and extension
      const newFilename = `(0)-twitter-${files.indexOf(file)}.${extension}`;
      const destinationPath = path.join(destinationDir, newFilename);

      // Copy the file with the new name to the destination directory
      await copyFileAsync(sourcePath, destinationPath);
     // console.log(`Copied ${file} to ${destinationPath}`);
    } else if (stats.isDirectory()) {
      // Recursively copy files from the subdirectory
      await copyMediaWithId(sourcePath, destinationDir);
    }
  }
}

// Usage:
const sourceFolder = 'D:\\perso\\websites\\twitter';
const destinationFolder = 'd:\\result';

// Create the destination folder if it doesn't exist
if (!fs.existsSync(destinationFolder)) {
  fs.mkdirSync(destinationFolder, { recursive: true });
}

copyMediaWithId(sourceFolder, destinationFolder)
  .then(() => {
    console.log('La copie des fichiers avec renommage a été effectuée.');
  })
  .catch((err) => {
    console.error('Une erreur est survenue :', err);
  });

// Usage:
