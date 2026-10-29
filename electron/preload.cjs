const { contextBridge, ipcRenderer } = require('electron')

// Expose only the song-ID download action; filesystem paths stay in the main process.
contextBridge.exposeInMainWorld('tingyuDesktop', {
  downloadSong: (id) => ipcRenderer.invoke('music:download', id),
})
