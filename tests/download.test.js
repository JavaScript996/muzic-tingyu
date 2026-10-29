import { test } from 'node:test'
import { Buffer } from 'node:buffer'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Writable } from 'node:stream'
import {
  downloadFilename,
  validateAudioUrl,
  resolveSongDownload,
  fetchSongAudio,
  saveSongAudio,
  streamSongDownload,
} from '../server/download.mjs'

test('download filenames stay inside a selected folder and use audio extensions', () => {
  assert.equal(downloadFilename('../CON', 'a/b:c', 'exe'), '.._CON - a_b_c.mp3')
  assert.equal(downloadFilename('CON', '', 'mp3'), '_CON.mp3')
  assert.equal(downloadFilename('歌名', '歌手', 'flac'), '歌名 - 歌手.flac')
  assert.equal(
    validateAudioUrl('http://m701.music.126.net/music.mp3'),
    'https://m701.music.126.net/music.mp3',
  )
  for (const url of [
    'https://music.126.net.attacker.com/a',
    'http://127.0.0.1/a',
    'file:///private',
    'https://user:pass@m701.music.126.net/a',
  ])
    assert.throws(() => validateAudioUrl(url))
})

test('fresh resolution rejects restricted songs and preview clips', async (context) => {
  let audio = { data: [{ id: 1, url: null }] }
  context.mock.method(
    globalThis,
    'fetch',
    async (url) =>
      new Response(
        JSON.stringify(
          url.includes('/song/detail/')
            ? { songs: [{ id: 1, name: '歌曲', artists: [{ name: '歌手' }] }] }
            : audio,
        ),
      ),
  )
  await assert.rejects(resolveSongDownload(1), /完整音频/)
  audio = {
    data: [{ id: 1, url: 'https://m701.music.126.net/song.mp3', freeTrialInfo: { end: 30 } }],
  }
  await assert.rejects(resolveSongDownload(1), /仅试听/)
  audio = { data: [{ id: 1, url: 'https://m701.music.126.net/song.mp3', type: 'mp3' }] }
  assert.equal((await resolveSongDownload(1)).filename, '歌曲 - 歌手.mp3')
  await assert.rejects(resolveSongDownload('../file'), /编号无效/)
})

test('audio requests reject HTML failures and redirects to unrelated hosts', async (context) => {
  context.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response('<html>forbidden</html>', { headers: { 'Content-Type': 'text/html' } }),
  )
  await assert.rejects(fetchSongAudio({ url: 'https://m701.music.126.net/audio.mp3' }), /下载失败/)
  context.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } }),
  )
  await assert.rejects(fetchSongAudio({ url: 'https://m701.music.126.net/audio.mp3' }), /地址无效/)
})

test('saving writes complete bytes and leaves existing files intact on failure', async (context) => {
  const root = await mkdtemp(join(tmpdir(), 'tingyu-download-test-'))
  assert.ok(root.startsWith(join(tmpdir(), 'tingyu-download-test-')))
  try {
    const target = join(root, 'song.mp3')
    const payload = Buffer.from('ID3-test-audio')
    context.mock.method(
      globalThis,
      'fetch',
      async () => new Response(payload, { headers: { 'Content-Type': 'audio/mpeg' } }),
    )
    await saveSongAudio({ url: 'https://m701.music.126.net/audio.mp3' }, target)
    assert.deepEqual(await readFile(target), payload)
    await writeFile(target, 'original')
    context.mock.method(
      globalThis,
      'fetch',
      async () =>
        new Response(
          new ReadableStream({
            start(controller) {
              controller.error(new Error('connection lost'))
            },
          }),
          { headers: { 'Content-Type': 'audio/mpeg' } },
        ),
    )
    await assert.rejects(
      saveSongAudio({ url: 'https://m701.music.126.net/audio.mp3' }, target),
      /connection lost/,
    )
    assert.equal(await readFile(target, 'utf8'), 'original')
    assert.deepEqual(await readdir(root), ['song.mp3'])
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('web downloads stream audio with an attachment filename', async (context) => {
  const payload = Buffer.from('ID3-web-audio')
  context.mock.method(globalThis, 'fetch', async (url) => {
    if (url.includes('/song/detail/'))
      return new Response(
        JSON.stringify({ songs: [{ id: 1, name: '歌名', artists: [{ name: '歌手' }] }] }),
      )
    if (url.includes('/song/enhance/'))
      return new Response(
        JSON.stringify({
          data: [{ id: 1, url: 'https://m701.music.126.net/audio.mp3', type: 'mp3' }],
        }),
      )
    return new Response(payload, { headers: { 'Content-Type': 'audio/mpeg' } })
  })
  const chunks = [],
    headers = {}
  const response = new Writable({
    write(chunk, _encoding, callback) {
      chunks.push(chunk)
      callback()
    },
  })
  response.setHeader = (name, value) => {
    headers[name] = value
  }
  await streamSongDownload({}, response, 1)
  assert.equal(response.statusCode, 200)
  assert.match(headers['Content-Disposition'], /attachment;.*filename\*=UTF-8''/)
  assert.deepEqual(Buffer.concat(chunks), payload)
})
