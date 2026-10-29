import { readFile } from 'node:fs/promises'
import { resolve, extname, relative, isAbsolute } from 'node:path'
import { musicApi } from '../server/api.mjs'

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}
const policy =
  "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https: data: blob:; media-src 'self' https: blob:; connect-src 'self' https: http://localhost:* http://127.0.0.1:*; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"

// Serve the bundled app and its fixed-upstream API without binding any network port.
export async function handleAppRequest(request, root) {
  const url = new URL(request.url)
  if (url.protocol !== 'tingyu:' || url.host !== 'app')
    return new Response('Forbidden', { status: 403 })
  if (request.method !== 'GET') return new Response('Method not allowed', { status: 405 })
  if (url.pathname === '/api/download') return new Response('请使用桌面下载按钮', { status: 400 })
  if (url.pathname.startsWith('/api/')) {
    let body = '',
      status = 200
    const headers = new Headers()
    await musicApi(
      { url: url.pathname + url.search },
      {
        setHeader(name, value) {
          headers.set(name, value)
        },
        set statusCode(value) {
          status = value
        },
        end(value) {
          body = value
        },
      },
      () => {
        status = 404
      },
    )
    return new Response(body, { status, headers })
  }
  try {
    const file = resolve(
      root,
      `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`,
    )
    const subpath = relative(root, file)
    if (subpath.startsWith('..') || isAbsolute(subpath))
      return new Response('Forbidden', { status: 403 })
    return new Response(await readFile(file), {
      headers: {
        'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
        'Content-Security-Policy': policy,
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
