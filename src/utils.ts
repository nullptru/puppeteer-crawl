import fs from 'fs';
import https from 'https';

export const download = (url: string, destination: string) => new Promise((resolve, reject) => {
  const file = fs.createWriteStream(destination);

  https.get(url, response => {
    response.pipe(file);

    file.on('finish', () => {
      file.close();
      resolve(true);
    });
  }).on('error', error => {
    fs.unlinkSync(destination);

    reject(error.message);
  });
});

export const createDir = (path: string) => {
  if (fs.existsSync(path)) {
    deleteFolderRecursive(path);
  }
  fs.mkdirSync(path, {
    recursive: true
  });
}

function deleteFolderRecursive(path: string) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file) {
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};