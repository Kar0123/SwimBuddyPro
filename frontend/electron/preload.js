const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Menu events
  onMenuNewSwimmer: (callback) => ipcRenderer.on('menu-new-swimmer', callback),
  onMenuRefreshData: (callback) => ipcRenderer.on('menu-refresh-data', callback),
  onMenuExportData: (callback) => ipcRenderer.on('menu-export-data', callback),
  onMenuViewDashboard: (callback) => ipcRenderer.on('menu-view-dashboard', callback),
  onMenuViewPersonalBests: (callback) => ipcRenderer.on('menu-view-personal-bests', callback),
  onMenuViewAnalytics: (callback) => ipcRenderer.on('menu-view-analytics', callback),
  onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),

  // Window controls
  minimizeWindow: () => ipcRenderer.send('minimize-window'),
  maximizeWindow: () => ipcRenderer.send('maximize-window'),
  closeWindow: () => ipcRenderer.send('close-window'),

  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => process.platform,

  // File operations (for future use)
  openFile: () => ipcRenderer.invoke('open-file'),
  saveFile: (data) => ipcRenderer.invoke('save-file', data),

  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// Swimming theme colors for the renderer process
contextBridge.exposeInMainWorld('swimmingTheme', {
  colors: {
    primary: {
      50: '#E3F2FD',
      100: '#BBDEFB',
      200: '#90CAF9',
      300: '#64B5F6',
      400: '#42A5F5',
      500: '#2196F3',
      600: '#1E88E5',
      700: '#1976D2',
      800: '#1565C0',
      900: '#0D47A1'
    },
    aqua: {
      50: '#E0F2F1',
      100: '#B2DFDB',
      200: '#80CBC4',
      300: '#4DB6AC',
      400: '#26A69A',
      500: '#009688',
      600: '#00897B',
      700: '#00796B',
      800: '#00695C',
      900: '#004D40'
    },
    wave: {
      50: '#E8F5E8',
      100: '#C8E6C9',
      200: '#A5D6A7',
      300: '#81C784',
      400: '#66BB6A',
      500: '#4CAF50',
      600: '#43A047',
      700: '#388E3C',
      800: '#2E7D32',
      900: '#1B5E20'
    }
  }
});
