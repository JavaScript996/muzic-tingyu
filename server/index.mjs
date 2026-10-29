import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { musicApi } from './api.mjs'

const root = resolve('dist')
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
}

// Serve the built SPA and the same music API used by Vite.
createServer((req, res) =>
  musicApi(req, res, async () => {
    try {
      const path = resolve(
        root,
        `.${decodeURIComponent(new URL(req.url, 'http://localhost').pathname)}`,
      )
      if (path !== root && !path.startsWith(root + sep)) {
        res.writeHead(403).end()
        return
      }
      let file
      try {
        file = await readFile(path)
        res.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream')
      } catch {
        file = await readFile(resolve(root, 'index.html'))
        res.setHeader('Content-Type', 'text/html')
      }
      res.end(file)
    } catch {
      res.writeHead(500).end('请先运行 npm run build')
    }
  }),
).listen(3000, () => console.log('听屿 http://localhost:3000'))
