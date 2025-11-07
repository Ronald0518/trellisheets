const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createZone: (data) => ipcRenderer.invoke('create-zone', data),
  listFiles: (folderPath) => ipcRenderer.invoke('list-files', folderPath),
  loadZones: () => ipcRenderer.invoke('load-zones'),
  updateZone: (id, updates) => ipcRenderer.invoke('update-zone', id, updates),
  deleteZone: (id) => ipcRenderer.invoke('delete-zone', id),
  updatePinOrder: (updates) => ipcRenderer.invoke('update-pin-order', updates),
  showFileMenu: (filePath) => ipcRenderer.send('show-file-menu', filePath),
  onNotification: (callback) => {
    ipcRenderer.on('show-notification', callback);
    return () => ipcRenderer.removeListener('show-notification', callback);
  }
});
