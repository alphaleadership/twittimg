const fs = require('fs');
const path = require('path');

function addWebpExtensionToFilesInFolder(folderPath) {
  try {
    fs.readdirSync(folderPath).forEach(file => {
      const filePath = path.join(folderPath, file);
      if (fs.statSync(filePath).isFile()) {
        // Vérifier si le chemin est un fichier et s'il n'a pas déjà d'extension
        if (!path.extname(file)) {
          addWebpExtensionToFile(filePath);
        }
      }
    });
    console.log('Webp extension added to files in the folder successfully!');
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
}

function addWebpExtensionToFile(filePath) {
  try {
    const newFilePath = filePath + '.webp';
    fs.renameSync(filePath, newFilePath);
  } catch (error) {
    console.error('Error occurred:', error.message);
  }
}

// Usage example:
const folderPath = 'D:\\perso\\websites\\twitter\\pbs.twimg.com\\media'; // Replace with the path to your folder
addWebpExtensionToFilesInFolder(folderPath);
