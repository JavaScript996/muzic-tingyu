import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { handleAppRequest } from '../electron/handler.mjs'

test('desktop protocol serves bundled UI with a content security policy and rejects traversal', async () => {
  const root = await mkdtemp(join(tmpdir(), 'tingyu-desktop-test-'))
  assert.ok(root.startsWith(join(tmpdir(), 'tingyu-desktop-test-')))
  try {
    await writeFile(join(root, 'index.html'), '<h1>听屿音乐</h1>')
    const response = await handleAppRequest(new Request('tingyu://app/index.html'), root)
    assert.match(await response.text(), /听屿音乐/)
    assert.match(response.headers.get('content-security-policy'), /script-src 'self'/)
    assert.equal(
      (await handleAppRequest(new Request('tingyu://app/%2e%2e%5cprivate.txt'), root)).status,
      403,
    )
    assert.equal(
      (await handleAppRequest(new Request('tingyu://external/index.html'), root)).status,
      403,
    )
    assert.equal((await handleAppRequest(new Request('tingyu://app/missing.js'), root)).status, 404)
    assert.equal(
      (await handleAppRequest(new Request('tingyu://app/api/toplist', { method: 'POST' }), root))
        .status,
      405,
    )
  } finally {
    await rm(root, { recursive: true, force: true })
  }
})

test('desktop protocol embeds the music proxy without a running web server', async (context) => {
  context.mock.method(globalThis, 'fetch', async (url) => {
    assert.match(url, /^https:\/\/music\.163\.com\/api\/song\/detail\//)
    return { status: 200, text: async () => '{"code":200,"songs":[{"id":139774}]}' }
  })
  const response = await handleAppRequest(
    new Request('tingyu://app/api/song/detail?ids=139774'),
    '.',
  )
  assert.equal(response.status, 200)
  assert.equal((await response.json()).songs[0].id, 139774)
})
