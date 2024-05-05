window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
})


// preloadスクリプトを介してレンダラープロセスとメインプロセス間のAPIを公開
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', {
    saveData: (data) => ipcRenderer.send('save-data', data),
    receiveSaveDataResponse: (callback) => ipcRenderer.on('save-data-response', callback)
});


