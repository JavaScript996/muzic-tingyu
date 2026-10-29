import { streamSongDownload } from './download.mjs'

const origin = 'https://music.163.com'

// Handle the public NetEase catalog endpoints for development and production.
export async function musicApi(req, res, next) {
  const url = new URL(req.url, 'http://localhost')
  if (!url.pathname.startsWith('/api/')) return next()
  const route = url.pathname.slice(4)
  const query = url.searchParams
  if (route === '/download') return streamSongDownload(req, res, query.get('id'))
  const routes = {
    '/personalized': ['/personalized/playlist', { limit: query.get('limit') || 8 }],
    '/cloudsearch': [
      '/search/get/web',
      { s: query.get('keywords') || '', type: 1, offset: 0, limit: 50 },
    ],
    '/song/detail': ['/song/detail/', { ids: `[${query.get('ids') || ''}]` }],
    '/lyric': ['/song/lyric', { id: query.get('id'), lv: -1, kv: -1, tv: -1 }],
    '/playlist/detail': ['/v6/playlist/detail', { id: query.get('id'), n: 100, s: 0 }],
    '/toplist': ['/toplist', {}],
    '/song/url/v1': ['/song/enhance/player/url', { ids: `[${query.get('id') || ''}]`, br: 128000 }],
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  if (!routes[route]) {
    res.statusCode = 404
    res.end(JSON.stringify({ message: '接口不存在' }))
    return
  }
  try {
    const [path, params] = routes[route]
    const response = await fetch(`${origin}/api${path}?${new URLSearchParams(params)}`, {
      headers: { Referer: `${origin}/`, 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(12000),
    })
    const body = await response.text()
    JSON.parse(body)
    res.statusCode = response.status
    res.end(body)
  } catch {
    res.statusCode = 502
    res.end(
      JSON.stringify({
        code: 502,
        message: '网易云服务暂时不可用，请稍后重试或配置 API 服务地址。',
      }),
    )
  }
}
