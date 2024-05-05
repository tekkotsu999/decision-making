// main.js

// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const path = require('node:path');

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {

    // カレントディレクトリを main.js が存在するディレクトリに設定
    process.chdir(__dirname);

    createWindow()

    // IPC ハンドラの設定
    ipcMain.on('save-data', (event, data) => {
        const filePath = path.join(__dirname, 'myData.json'); // ファイルパスの指定
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                event.reply('save-data-response', 'Failure');
                console.error('Error saving data:', err);
                return;
            }
            event.reply('save-data-response', 'Success');
            console.log('Data saved successfully to:', filePath);
        });
    });
    
    // レンダラープロセスから、ファイルダイアログを開くリクエストを受取り、指定のフィアルパスをレンダラープロセスに返す
    ipcMain.handle('open-file-dialog', async (event) => {
        const mainWindow = BrowserWindow.getFocusedWindow();

        // ファイルダイアログを表示
        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });

        if (canceled) {
            return { success: false, path: '' };
        } else {
            return { success: true, path: filePaths[0] };
        }
    });
    
    // レンダラープロセスからの読み込みリクエストを受け取り、ファイルの内容を読み込んでレンダラープロセスに返す
    ipcMain.on('load-data', (event) => {
        const filePath = path.join(__dirname, 'myData.json');
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) {
                console.error('Error loading data:', err);
                event.reply('load-data-response', { success: false, message: 'Failed to load data', data: null });
                return;
            }
            event.reply('load-data-response', { success: true, message: 'Data loaded successfully', data: JSON.parse(data) });
        });
    });
    

    app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})



