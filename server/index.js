import fs from 'node:fs'
import http from 'node:http'
import https from 'node:https'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distDir = path.resolve(process.env.DIST_DIR ?? path.join(rootDir, 'dist'))
const port = Number.parseInt(process.env.PORT ?? '8080', 10)
const host = process.env.HOST ?? '0.0.0.0'
const certFile = process.env.HTTPS_CERT_FILE
const keyFile = process.env.HTTPS_KEY_FILE

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
}

function getConfigScript() {
  const fallbackUrls = (process.env.HA_DASHBOARD_FALLBACK_URLS ?? process.env.HA_DASHBOARD_FALLBACK_URL ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return `window.HA_DASHBOARD_CONFIG = ${JSON.stringify({
    baseUrl: process.env.HA_DASHBOARD_BASE_URL ?? '',
    fallbackUrls,
    token: process.env.HA_DASHBOARD_TOKEN ?? '',
  })};\n`
}

function send(response, statusCode, headers, body) {
  response.writeHead(statusCode, headers)
  response.end(body)
}

function resolveRequestPath(requestUrl) {
  const url = new URL(requestUrl, 'http://localhost')
  const pathname = decodeURIComponent(url.pathname)
  const normalizedPath = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '')
  return path.join(distDir, normalizedPath)
}

function isPathInside(parentPath, childPath) {
  const relativePath = path.relative(parentPath, childPath)
  return relativePath === '' || (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
}

function serveFile(request, response) {
  const url = new URL(request.url, 'http://localhost')

  if (url.pathname === '/app-config.js') {
    send(response, 200, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/javascript; charset=utf-8',
    }, getConfigScript())
    return
  }

  const requestPath = resolveRequestPath(request.url)
  const safeRequestPath = isPathInside(distDir, requestPath) ? requestPath : path.join(distDir, 'index.html')
  const filePath = fs.existsSync(safeRequestPath) && fs.statSync(safeRequestPath).isFile()
    ? safeRequestPath
    : path.join(distDir, 'index.html')
  const extension = path.extname(filePath)
  const isAsset = filePath.includes(`${path.sep}assets${path.sep}`)

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(response, 404, { 'Content-Type': 'text/plain; charset=utf-8' }, 'Not found')
      return
    }

    send(response, 200, {
      'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
      'Content-Type': mimeTypes[extension] ?? 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    }, data)
  })
}

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error(`Production build not found at ${distDir}. Run "npm run build" first.`)
  process.exit(1)
}

const server = certFile && keyFile
  ? https.createServer({
    cert: fs.readFileSync(certFile),
    key: fs.readFileSync(keyFile),
  }, serveFile)
  : http.createServer(serveFile)

server.listen(port, host, () => {
  const protocol = certFile && keyFile ? 'https' : 'http'
  console.log(`Home dashboard running at ${protocol}://${host}:${port}`)
})

server.on('error', (error) => {
  console.error(`Could not start production server: ${error.message}`)
  process.exit(1)
})
