import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseLyrics, normalizeSong, classifyAvailability } from '../src/services/music.js'
import { musicApi } from '../server/api.mjs'

test('LRC expands repeated timestamps, preserves fractions, and ignores metadata', () => {
  assert.deepEqual(
    parseLyrics('[ar:artist]\n[01:02.350][00:03.10]同一句歌词\n[00:00.00]\n[00:01]开始'),
    [
      { time: 1, text: '开始' },
      { time: 3.1, text: '同一句歌词' },
      { time: 62.35, text: '同一句歌词' },
    ],
  )
  assert.deepEqual(parseLyrics(), [])
  assert.deepEqual(parseLyrics('没有时间戳'), [])
})

test('normalization accepts official and community API track schemas', () => {
  const expected = {
    id: 1,
    name: '歌曲',
    artist: '甲 / 乙',
    album: '专辑',
    cover: 'cover.jpg',
    duration: 240,
  }
  assert.deepEqual(
    normalizeSong({
      id: 1,
      name: '歌曲',
      artists: [{ name: '甲' }, { name: '乙' }],
      album: { name: '专辑', picUrl: 'cover.jpg' },
      duration: 240000,
    }),
    expected,
  )
  assert.deepEqual(
    normalizeSong({
      id: 1,
      name: '歌曲',
      ar: [{ name: '甲' }, { name: '乙' }],
      al: { name: '专辑', picUrl: 'cover.jpg' },
      dt: 240000,
    }),
    expected,
  )
})

// Run middleware without a socket, recording the response.
test('availability uses actual URLs, distinguishes restrictions, and leaves failed checks unconfirmed', () => {
  assert.equal(
    classifyAvailability({ fee: 1 }, { url: 'https://audio/song.mp3', fee: 1 }).status,
    'available',
  )
  assert.equal(
    classifyAvailability(
      {},
      { url: 'https://audio/trial.mp3', freeTrialInfo: { start: 0, end: 30 } },
    ).label,
    '仅试听',
  )
  assert.equal(classifyAvailability({}, { url: null, code: -110, fee: 1 }).label, '会员歌曲')
  assert.equal(classifyAvailability({ fee: 4 }, { url: null }).label, '付费歌曲')
  assert.equal(classifyAvailability({ fee: 1 }, { url: null, code: 404 }).label, '版权受限')
  assert.equal(classifyAvailability({}, { url: null }).label, '暂不可播放')
  assert.equal(classifyAvailability({ fee: 1 }, undefined).status, 'unknown')
  assert.equal(classifyAvailability({ localUrl: 'blob:local' }).status, 'available')
  assert.equal(normalizeSong({ id: 1, fee: 1 }).fee, 1)
})

// Run middleware without a socket, recording the response.
async function invoke(url) {
  let body
  const response = {
    statusCode: 200,
    setHeader() {},
    end(value) {
      body = value
    },
  }
  await musicApi({ url }, response, () => {
    body = '{"next":true}'
  })
  return { status: response.statusCode, data: JSON.parse(body) }
}

test('audio proxy preserves copyright restrictions instead of inventing audio URLs', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url) => {
    assert.ok(url.startsWith('https://music.163.com/api/song/enhance/player/url?'))
    assert.equal(new URL(url).searchParams.get('ids'), '[186016]')
    return {
      status: 200,
      text: async () => JSON.stringify({ code: 200, data: [{ id: 186016, url: null }] }),
    }
  })
  assert.equal((await invoke('/api/song/url/v1?id=186016')).data.data[0].url, null)
})

test('search encodes terms and upstream failure returns recoverable JSON', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(new URL(url).searchParams.get('s'), '歌名 & 歌手')
    throw new Error('offline')
  })
  const result = await invoke(
    '/api/cloudsearch?keywords=%E6%AD%8C%E5%90%8D%20%26%20%E6%AD%8C%E6%89%8B',
  )
  assert.equal(result.status, 502)
  assert.equal(result.data.code, 502)
  assert.equal((await invoke('/api/unknown')).status, 404)
  assert.deepEqual((await invoke('/assets/app.js')).data, { next: true })
})

test('audio proxy accepts batches so list permissions need no per-song request', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url) => {
    assert.equal(new URL(url).searchParams.get('ids'), '[139774,186016]')
    return {
      status: 200,
      text: async () =>
        JSON.stringify({
          code: 200,
          data: [
            { id: 139774, url: 'https://audio/song.mp3' },
            { id: 186016, url: null, code: 404 },
          ],
        }),
    }
  })
  const result = await invoke('/api/song/url/v1?id=139774,186016')
  assert.equal(result.data.data.length, 2)
})
