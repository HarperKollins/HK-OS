const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hkos', {
  isElectron: true,
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),

  // Apps Engine
  listApps: () => ipcRenderer.invoke('apps:list'),
  installWebApp: (appData) => ipcRenderer.invoke('apps:install-web', appData),
  deleteApp: (appId) => ipcRenderer.invoke('apps:delete', appId),
  launchNative: (executable) => ipcRenderer.invoke('apps:launch-native', executable),

  // Real Filesystem
  fsList: (subPath) => ipcRenderer.invoke('fs:list', subPath),
  fsRead: (filePath) => ipcRenderer.invoke('fs:read', filePath),
  fsWrite: (filePath, content) => ipcRenderer.invoke('fs:write', { filePath, content }),
  fsDelete: (filePath) => ipcRenderer.invoke('fs:delete', filePath),
  fsMkdir: (folderPath) => ipcRenderer.invoke('fs:mkdir', folderPath),

  // Real Code Execution
  execRun: (language, code) => ipcRenderer.invoke('exec:run', { language, code }),

  // Real Winget Installation
  wingetInstall: (params) => ipcRenderer.invoke('winget:install', params),
  onWingetLog: (packageId, callback) => {
    const channel = `winget:log:${packageId}`;
    const listener = (event, data) => callback(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },

  // External Links & Google OAuth
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
});
