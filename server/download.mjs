import { createWriteStream } from 'node:fs'
import { rename, stat, unlink } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { randomUUID } from 'node:crypto'

const origin = 'https://music.163.com'

// Remove path separators, Windows reserved names, and unsupported file extensions.
export function downloadFilename(name, artist, extension = 'mp3') {
  const stem = `${name || '未知歌曲'}${artist ? ` - ${artist}` : ''}`
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '_')
    .replace(/[. ]+$/g, '')
    .slice(0, 150)
  const safeStem = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(stem) ? `_${stem}` : stem
  const type = ['mp3', 'flac', 'm4a', 'aac', 'ogg', 'wav'].includes(extension) ? extension : 'mp3'
  return `${safeStem || '歌曲'}.${type}`
}

// Only download from NetEase music CDNs, including each redirect target.
export function validateAudioUrl(value) {
  const url = new URL(value)
  const trusted = ['music.126.net', 'music.163.com', 'music.126.com'].some(
    (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`),
  )
  if (
    !trusted ||
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    (url.port && !['80', '443'].includes(url.port))
  )
    throw new Error('音频下载地址无效')
  url.protocol = 'https:'
  if (url.port === '80') url.port = ''
  return url.href
}

// Resolve a fresh, complete public audio URL; do not turn preview clips into downloads.
export async function resolveSongDownload(id) {
  if (!/^\d{1,18}$/.test(String(id))) throw new Error('歌曲编号无效')
  const paths = [
    `/api/song/detail/?ids=[${id}]`,
    `/api/song/enhance/player/url?ids=[${id}]&br=128000`,
  ]
  const [detail, audio] = await Promise.all(
    paths.map(async (path) => {
      const response = await fetch(origin + path, {
        headers: { Referer: origin + '/' },
        signal: AbortSignal.timeout(16000),
      })
      if (!response.ok) throw new Error('下载服务暂时不可用')
      return response.json()
    }),
  )
  const song = detail.songs?.find((song) => String(song.id) === String(id))
  const source = audio.data?.find((song) => String(song.id) === String(id))
  if (!source?.url || source.freeTrialInfo)
    throw new Error(source?.freeTrialInfo ? '仅试听歌曲不支持下载' : '这首歌曲暂无可下载的完整音频')
  const artist = (song?.ar || song?.artists || []).map((item) => item.name).join('、')
  const filename = downloadFilename(song?.name, artist, source.type)
  return {
    url: validateAudioUrl(source.url),
    filename,
    type: filename.split('.').at(-1),
  }
}

// Check every CDN redirect and reject HTML/JSON error pages masquerading as music.
export async function fetchSongAudio(source, signal = AbortSignal.timeout(180000)) {
  let url = validateAudioUrl(source.url)
  for (let redirect = 0; redirect < 5; redirect++) {
    const response = await fetch(url, { redirect: 'manual', signal })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location) throw new Error('音频下载重定向无效')
      url = validateAudioUrl(new URL(location, url).href)
      continue
    }
    const type = response.headers.get('content-type') || ''
    if (!response.ok || !response.body || !/^(audio\/|application\/octet-stream)/i.test(type)) {
      await response.body?.cancel()
      throw new Error('音频下载失败，请稍后重试')
    }
    return response
  }
  throw new Error('音频下载重定向过多')
}

// Write to a unique partial file and replace the selected target only after completion.
export async function saveSongAudio(source, filePath) {
  const partial = `${filePath}.${randomUUID()}.part`
  try {
    const response = await fetchSongAudio(source)
    await pipeline(Readable.fromWeb(response.body), createWriteStream(partial, { flags: 'wx' }))
    if (!(await stat(partial)).size) throw new Error('下载的音频为空，请稍后重试')
    await rename(partial, filePath)
  } catch (error) {
    await unlink(partial).catch(() => {})
    throw error
  }
}

// Stream an attachment through the web app's same-origin proxy.
export async function streamSongDownload(req, res, id) {
  const controller = new AbortController()
  const abort = () => controller.abort()
  res.once('close', abort)
  try {
    const source = await resolveSongDownload(id)
    const response = await fetchSongAudio(
      source,
      AbortSignal.any([controller.signal, AbortSignal.timeout(180000)]),
    )
    res.statusCode = 200
    res.setHeader('Content-Type', response.headers.get('content-type'))
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="song.${source.type}"; filename*=UTF-8''${encodeURIComponent(source.filename)}`,
    )
    const length = response.headers.get('content-length')
    if (length) res.setHeader('Content-Length', length)
    await pipeline(Readable.fromWeb(response.body), res)
  } catch (error) {
    if (!res.headersSent) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify({ message: error.message }))
    } else res.destroy(error)
  } finally {
    res.removeListener('close', abort)
  }
}
