const { ipcMain, Menu } = require('electron');
const fs = require('fs');
const path = require('path');
const {
  initializeDatabase,
  createZone,
  loadZones,
  updateZone,
  deleteZone,
  updatePinOrder
} = require('./db/database');

initializeDatabase();

function setupIpcHandlers(mainWindow) {
  ipcMain.handle('list-files', async (event, folderPath) => {
    try {
      const files = await fs.promises.readdir(folderPath);
      const fileDetails = await Promise.all(
        files.map(async (file) => {
          const filePath = path.join(folderPath, file);
          const stats = await fs.promises.stat(filePath);
          return {
            name: file,
            path: filePath,
            isDirectory: stats.isDirectory(),
            size: stats.size,
            modified: stats.mtime
          };
        })
      );
      return { success: true, files: fileDetails };
    } catch (err) {
      console.error('Error listing files:', err);
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('create-zone', (event, data) => createZone(data));
  ipcMain.handle('load-zones', () => loadZones());
  ipcMain.handle('update-zone', (event, id, updates) => updateZone(id, updates));
  ipcMain.handle('delete-zone', (event, id) => deleteZone(id));
  ipcMain.handle('update-pin-order', (event, updates) => updatePinOrder(updates));

  ipcMain.on('show-file-menu', (event, filePath) => {
    const template = [
      {
        label: 'Open',
        click: () => {
          require('electron').shell.openPath(filePath);
        }
      }
    ];
    const menu = Menu.buildFromTemplate(template);
    menu.popup({ window: mainWindow });
  });
}

module.exports = { setupIpcHandlers };
