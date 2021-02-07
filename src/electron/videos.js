

import { ipcMain, dialog, BrowserWindow } from 'electron'
const path = require('path');
const ffbinaries = require('ffbinaries');
const ffmpeg = require('fluent-ffmpeg');
import { convertBytes } from '../utilities/file-size'
const walk = require('walk');
const sharp = require('sharp');
const fs = require('fs');
import { nanoid } from 'nanoid';
var glob = require("glob");

// const unhandled = require('electron-unhandled');
// unhandled();

const downloadFFBinaries = (app) => {
  ffmpeg.setFfmpegPath(path.join(app.getPath('userData'), 'binaries', 'ffmpeg'));
  ffmpeg.setFfprobePath(path.join(app.getPath('userData'), 'binaries', 'ffprobe'));
  const dest = path.join(app.getPath('userData'), 'binaries');
  const platform = ffbinaries.detectPlatform();
  ffbinaries.downloadBinaries(['ffmpeg', 'ffprobe'], { platform: platform, quiet: true, destination: dest }, function () {
    // console.log('Downloaded ffmpeg and ffprobe binaries for ' + platform + ' to ' + dest + '.');
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
  ipcMain.on('getImageFilePath', function (event, data) {
    const window = BrowserWindow.getFocusedWindow();
    console.log(data)
    dialog.showOpenDialog(window, {
      filters: [
        { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
      ],
      properties: ['openFile']
    })
      .then(result => {
        let fileName = data.id + '-custom-' + nanoid(4) + '.png';
        sharp(result.filePaths[0]).resize({ width: 320, height: 180, fit: 'cover' }).png()
        .toFile(path.join(app.getPath('userData'), 'thumbnails', fileName))
          .then(function (newFileInfo) {
            event.sender.send('open-image-file-dialog-reply', { image: fileName })
          })
          .catch(function (err) {
            event.sender.send('open-image-file-dialog-reply', { image: null })
            console.log("Sharp Error", err);
          });
      });
  });
  ipcMain.on('getVideoFilePath', function (event, data) {
    const window = BrowserWindow.getFocusedWindow();
    dialog.showOpenDialog(window, {
      filters: [
        { name: 'Videos', extensions: ['mkv', 'avi', 'mp4', 'm4v'] }
      ],
      properties: ['openFile']
    })
      .then(result => {
        event.sender.send('open-video-file-dialog-reply', { video: result.filePaths })
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
  ipcMain.on('editVideoDetails', function (event, data) {
    console.log(data);
    if (data.isFileChanged) {
      processFile(data.file.filePath, data.file, false, data.file.id).then(newFile => {
        data.file.name = newFile.name;
        data.file.size = newFile.size;
        data.file.duration = newFile.duration;
        editFile(event, data.file);
      })
      .catch(err => {
        event.sender.send('edit-file-dialog-reply', { isSuccess: false })
      })
    } else {
      editFile(event, data.file);
    }
  });
  ipcMain.on('deleteVideo', function (event, data) {
    console.log(data);
    deleteFile(event, data.file);
  });
  ipcMain.on('getSettings', function (event, data) {
    console.log(data);
    getSettings(event, data);
  });
  ipcMain.on('saveSettings', function (event, data) {
    console.log(data);
    saveSettings(event, data);
  });

  const getSettings = (event, data) => {
    const settingsPath = path.join(app.getPath('userData'), 'data', 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const settingsData = fs.readFileSync(settingsPath);
      const settings = JSON.parse(settingsData);
      event.sender.send('get-settings-reply', { ...settings });
    } else {
      fs.writeFileSync(settingsPath, JSON.stringify({filter: '', categorization: '', sort: ''}));
      event.sender.send('get-settings-reply', null);
    }
  }

  const saveSettings = (event, data) => {
    const settingsPath = path.join(app.getPath('userData'), 'data', 'settings.json');
    const settingsData = fs.readFileSync(settingsPath);
    const settings = JSON.parse(settingsData);
    if(data.setting) {
      console.log("Writing to settings")
      settings[data.setting] = data.payload;
      fs.writeFileSync(settingsPath, JSON.stringify(settings));
    }
  }

  const editFile = (event, file) => {
    if(file && file.id) {
      db.update(file.id, file).then(() => {
        let cleanupImages = [];
        glob(app.getPath('userData') + '/thumbnails/' + file.id + '-custom-*.png', function (er, files) {
          cleanupImages = files;
          cleanupImages.filter(f => !f.includes(file.thumbnailPath)).forEach(img => {
            fs.unlinkSync(img);
          });
        });
        event.sender.send('edit-file-dialog-reply', { file: file, isSuccess: true })
      }).catch(err => {
        event.sender.send('edit-file-dialog-reply', { isSuccess: false })
      });
    }

  }

  const deleteFile = (event, file) => {
    if(file && file.id) {
      db.delete(file.id).then(() => {
        let cleanupImages = [];
        glob(app.getPath('userData') + '/thumbnails/' + file.id + '*.png', function (er, files) {
          cleanupImages = files;
          cleanupImages.forEach(img => {
            fs.unlinkSync(img);
          });
        });
        event.sender.send('delete-file-dialog-reply', { id: file.id, isSuccess: true })
      }).catch(err => {
        event.sender.send('delete-file-dialog-reply', { isSuccess: false })
      });
    }
  }

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

  const processFile = (filePath, data, isCreate = true, oldID = null) => {
    return new Promise((resolve, reject) => {
      console.log(isValidVideoExtension(filePath))
      if (isValidVideoExtension(filePath)) {
        ffmpeg.ffprobe(filePath, function (err, metadata) {
          if (err) {
            console.log('FFMPEG Error', err);
            reject();
          }
          else {
            const id = isCreate ? nanoid() : oldID;
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
                      composer: data.composer || '',
                      album: data.album || '',
                      genre: data.genre || '',
                      subgenre: data.subgenre || '',
                      releaseYear: data.releaseYear || '',
                      thumbnailPath: id + '.png'
                    };
                    console.log(file);
                    if(isCreate) {
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
                      resolve(file);
                    }
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