import process from 'node:process'
import { app, BrowserWindow, dialog, ipcMain, Menu, protocol, session } from 'electron'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFile } from 'node:fs/promises'
import { handleAppRequest } from './handler.mjs'
import { resolveSongDownload, saveSongAudio } from '../server/download.mjs'

const folder = dirname(fileURLToPath(import.meta.url))
const smokeTest = process.argv.includes('--smoke-test')
if (smokeTest && process.env.TINGYU_SMOKE_PROFILE)
  app.setPath('userData', process.env.TINGYU_SMOKE_PROFILE)
let mainWindow
let downloadBusy = false
app.setName('听屿音乐')
app.setAppUserModelId('com.tingyu.music')
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'tingyu',
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
])

// Bring the existing music window forward when its icon is clicked again.
if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', () => {
    if (mainWindow?.isMinimized()) mainWindow.restore()
    mainWindow?.show()
    mainWindow?.focus()
  })
  app
    .whenReady()
    .then(startApp)
    .catch(async (error) => {
      if (smokeTest && process.env.TINGYU_SMOKE_REPORT)
        await writeFile(
          process.env.TINGYU_SMOKE_REPORT,
          JSON.stringify({ passed: false, error: error.message }),
        )
      else dialog.showErrorBox('听屿启动失败', error.message)
      app.exit(1)
    })
}

// Start a sandboxed desktop window with a stable origin for local music-library storage.
async function startApp() {
  ipcMain.handle('music:download', downloadSong)
  protocol.handle('tingyu', (request) => handleAppRequest(request, join(folder, '../dist')))
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) =>
    callback(false),
  )
  Menu.setApplicationMenu(null)
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 900,
    minWidth: 760,
    minHeight: 600,
    title: '听屿音乐',
    icon: join(folder, '../build/icon.png'),
    backgroundColor: '#fafbf9',
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: join(folder, 'preload.cjs'),
    },
  })
  mainWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!url.startsWith('tingyu://app/')) event.preventDefault()
  })
  mainWindow.once('ready-to-show', () => {
    if (!smokeTest) mainWindow.show()
  })
  await mainWindow.loadURL('tingyu://app/index.html')
  if (smokeTest) await runSmokeTest()
}

// Recheck the song in the main process, then save only to the user's chosen path.
async function downloadSong(event, id) {
  if (
    event.sender !== mainWindow?.webContents ||
    event.senderFrame?.url !== 'tingyu://app/index.html'
  )
    return { status: 'error', message: '下载请求来源无效' }
  if (downloadBusy) return { status: 'error', message: '已有歌曲正在下载，请稍候' }
  downloadBusy = true
  try {
    const source = await resolveSongDownload(id)
    const choice =
      smokeTest && process.env.TINGYU_SMOKE_DOWNLOAD_DIR
        ? {
            canceled: false,
            filePath: join(process.env.TINGYU_SMOKE_DOWNLOAD_DIR, source.filename),
          }
        : await dialog.showSaveDialog(mainWindow, {
            title: '下载歌曲',
            defaultPath: join(app.getPath('downloads'), source.filename),
            buttonLabel: '保存歌曲',
            filters: [{ name: '音频文件', extensions: [source.type] }],
            properties: ['showOverwriteConfirmation'],
          })
    if (choice.canceled || !choice.filePath) return { status: 'cancelled' }
    await saveSongAudio(source, choice.filePath)
    return { status: 'saved', filename: source.filename }
  } catch (error) {
    return { status: 'error', message: error.message }
  } finally {
    downloadBusy = false
  }
}

// Exercise packaged rendering, persistent-origin storage, and the bundled API in Chromium.
async function runSmokeTest() {
  const report = await mainWindow.webContents.executeJavaScript(`(async () => {
    const audio = document.querySelector('audio')
    const detail = await fetch('/api/song/detail?ids=139774').then(response => response.json())
    localStorage.setItem('tingyu-desktop-check', 'ok')
    const storage = localStorage.getItem('tingyu-desktop-check')
    localStorage.removeItem('tingyu-desktop-check')
    const bridge = typeof window.tingyuDesktop?.downloadSong === 'function'
    ${process.env.TINGYU_SMOKE_DOWNLOAD_DIR ? 'const download = await window.tingyuDesktop.downloadSong(139774)' : 'const download = null'}
    return { title: document.title, heading: document.querySelector('h1')?.textContent, audio: !!audio, storage, song: detail.songs?.[0]?.id, origin: location.origin, bridge, download, downloadButtons: document.querySelectorAll('.download-button').length }
  })()`)
  const passed =
    report.heading?.includes('发现你的音乐') &&
    report.audio &&
    report.storage === 'ok' &&
    report.song === 139774 &&
    report.downloadButtons >= 5 &&
    report.bridge &&
    (!process.env.TINGYU_SMOKE_DOWNLOAD_DIR || report.download?.status === 'saved')
  const reportPath = process.env.TINGYU_SMOKE_REPORT
  if (reportPath) await writeFile(reportPath, JSON.stringify({ passed, ...report }, null, 2))
  app.exit(passed ? 0 : 1)
}

app.on('window-all-closed', () => app.quit())
