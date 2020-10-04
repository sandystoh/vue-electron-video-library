

import { ipcMain, dialog, BrowserWindow } from 'electron'
const path = require('path');
const ffbinaries = require('ffbinaries');
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(path.join(__dirname, 'binaries', 'ffmpeg'));
ffmpeg.setFfprobePath(path.join(__dirname, 'binaries', 'ffprobe'));
import { convertBytes } from '../utilities/file-size'
const walk = require('walk');
import { nanoid } from 'nanoid'
const files = [];

const downloadFFBinaries = () => {
  const dest = __dirname + '/binaries';
  const platform = ffbinaries.detectPlatform();
  ffbinaries.downloadBinaries(['ffmpeg', 'ffprobe'], { platform: platform, quiet: true, destination: dest }, function () {
    console.log('Downloaded ffmpeg and ffprobe binaries for ' + platform + ' to ' + dest + '.');
  });
}

const openFolderListener = (app, db) => {
  ipcMain.on('getDirectoryPath', function (event, data) {
    const window = BrowserWindow.getFocusedWindow();
    dialog.showOpenDialog(window, { properties: ['openDirectory'] })
      .then(result => {
        event.sender.send('get-directory-dialog-reply', { dir: result.filePaths[0] })
      });
  });
  ipcMain.on('getFilePaths', function (event, data) {
    const window = BrowserWindow.getFocusedWindow();
    dialog.showOpenDialog(window, {
      filters: [
        { name: 'Videos', extensions: ['mkv', 'avi', 'mp4', 'm4v'] }
      ],
      properties: ['multiSelections', 'openFile']
    })
      .then(result => {
        event.sender.send('open-file-paths-dialog-reply', { filePaths: result.filePaths })
      });
  });
  ipcMain.on('importFiles', function (event, data) {
    if (data && data.dir) {
      crawlFoldersAndImport(event, data.dir, data, 'import-files-dialog-reply');
    } else if (data && data.filePaths && data.filePaths.length) {
      const filePromises = [];
      data.filePaths.forEach(path => {
        filePromises.push(processFile(path, data));
      });
      Promise.all(filePromises)
        .then(files => {
          event.sender.send('import-files-dialog-reply', { files })
        }).catch(error => {
          event.sender.send('import-files-dialog-reply', { files: [] })
        })
    } else {
      event.sender.send('import-files-dialog-reply', { files: [] })
    }
    console.log('received data', data)
  });

  ipcMain.on('selectDirectory', function (event, data) {
    const window = BrowserWindow.getFocusedWindow();

    dialog.showOpenDialog(window, { properties: ['openDirectory'] })
      .then(result => {
        crawlFoldersAndImport(event, result.filePaths[0], null, 'open-folder-dialog-reply')
      })
      .catch(error => {
        console.log('Could not get file path')
      })
  });

  const crawlFoldersAndImport = (event, folderPath, data, replyPath) => {
    const fileList = [];
    var walker = walk.walk(folderPath, { followLinks: false });

    walker.on('file', function (root, stat, next) {
      console.log('walk file', root.replace(/\\/g, '/') + '/' + stat.name)
      // Add this file to the list of files if it is a video
      processFile(root.replace(/\\/g, '/') + '/' + stat.name, data)
        .then(file => {
          fileList.push(file);
          console.log('then', fileList)
          next();
        })
        .catch(() => {
          console.log('catch', fileList)
          next();
        });
    });

    walker.on('end', function () {
      console.log('ON END')
      // Send the path back to the renderer
      event.sender.send(replyPath, { files: fileList })
    });
  };
  const processFile = (filePath, data) => {
    return new Promise((resolve, reject) => {
      console.log(isValidVideoExtension(filePath))
      if (isValidVideoExtension(filePath)) {
        ffmpeg.ffprobe(filePath, function (err, metadata) {
          if (err) {
            console.log('FFMPEG Error', err);
            reject();
          }
          else {
            const id = nanoid();
            const proc = new ffmpeg(filePath)
              .takeScreenshots({
                count: 1,
                timemarks: ['15'],
                filename: id,
                size: '320x180'
              }, path.join(app.getPath('userData'), 'thumbnails'), function (err) {
                console.log('screenshots were saved')
              }).on('end', () => {
                db.findOne({ filePath }).then(docs => {
                  if (docs === null) {
                    const extension = path.extname(filePath);
                    const file = {
                      id,
                      name: path.basename(filePath),
                      displayName: path.basename(filePath, extension),
                      filePath: filePath,
                      size: convertBytes(metadata.format.size),
                      duration: Math.floor(metadata.format.duration),
                      artist: data.artist || '',
                      album: data.album || '',
                      genre: data.genre || ''
                    };
                    console.log(file);
                    db.create(file)
                      .then((data) => {
                        console.log('resolve', data)
                        resolve(file);
                      })
                      .catch((err) => {
                        console.log("err", err);
                        reject();
                      });
                  } else {
                    // fileList.push(docs);
                    reject();
                  }
                }).catch(err => {
                  console.log('Processing Error Occurred', err)
                  reject();
                })
              });
          }
        })
      } else {
        console.log('Invalid Extension')
        reject();
      }
    });
  };
  const isValidVideoExtension = (fileName) => {
    return (fileName.indexOf('.mp4') == fileName.length - 4
      || fileName.indexOf('.avi') == fileName.length - 4
      || fileName.indexOf('.m4v') == fileName.length - 4
      || fileName.indexOf('.mkv') == fileName.length - 4)
  }
}
export { downloadFFBinaries, openFolderListener }