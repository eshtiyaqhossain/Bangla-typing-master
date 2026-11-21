const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('okkhoroApp', {
  platform: process.platform,
});
