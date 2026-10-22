const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hkos', {
  isElectron: true,
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  saveFile: (filename, content) => ipcRenderer.invoke('save-file', { filename, content }),
  platform: process.platform,
});
