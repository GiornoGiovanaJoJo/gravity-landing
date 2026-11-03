/**
 * Сервер блога: рендерит /blog/, /blog/:slug/ и /sitemap.xml на лету, по
 * каждому запросу — а не один раз на сборке, как раньше (`scripts/build-blog.mjs`
 * больше не используется). Статья, опубликованная в CRM, должна появиться на
 * сайте сразу — ждать пересборки и передеплоя ради одной статьи было нельзя.
 *
 * Живёт в том же контейнере, что и nginx (см. Dockerfile и deploy/nginx.conf:
 * `location ~ ^/(blog/|sitemap\.xml)` проксирует сюда), слушает только
 * localhost — наружу этот порт не торчит.
 *
 * Посты CRM кэшируются в памяти на TTL_MS: без этого каждый visitor каждой
 * страницы блога бил бы по CRM напрямую. Если кэш устарел, но CRM ответила —
 * обновляем; если CRM недоступна — отдаём последний известный список, а не
 * падаем (посетитель не должен видеть пустой блог из-за сетевого сбоя).
 */

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { createBlogRenderer } from './blog-render.mjs'

const PORT = Number(process.env.BLOG_SERVER_PORT || 8787)
const DIST_DIR = process.env.DIST_DIR || '/usr/share/nginx/html'
const BLOG_API_URL = process.env.BLOG_API_URL || 'https://crm.gravityrpa.ru/api/public/blog'
const BASE = process.env.VITE_BASE || '/'
const SITE_URL = (process.env.SITE_URL || 'https://g-neuro.space').replace(/\/+$/, '')
const TTL_MS = 30_000

/** Адрес собранного CSS: имя с хешем лежит в index.html готовой сборки, читаем один раз при старте. */
function readCssPath() {
  try {
    const html = readFileSync(join(DIST_DIR, 'index.html'), 'utf8')
    const href = html.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)?.[1]
    if (!href) console.warn('blog-server: в index.html нет стилей — страницы блога будут без оформления')
    return href ?? null
  } catch (e) {
    console.warn(`blog-server: не удалось прочитать index.html (${e.message})`)
    return null
  }
}

const renderer = createBlogRenderer({ base: BASE, siteUrl: SITE_URL, cssPath: readCssPath() })

/** @type {{ posts: ReturnType<typeof renderer.prepare>[], fetchedAt: number } | null} */
let cache = null
/** @type {Promise<void> | null} */
let inFlight = null

async function fetchPosts() {
  const res = await fetch(BLOG_API_URL)
  if (!res.ok) throw new Error(`${BLOG_API_URL} ответил ${res.status}`)
  const raw = await res.json()
  if (!Array.isArray(raw)) throw new Error('неожиданный формат ответа')

  const posts = raw.map((p) => renderer.prepare(p))
  // Свежие сверху: список читают сверху вниз, старая статья первой строкой
  // выглядит как заброшенный блог.
  posts.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date))
  return posts
}

async function refresh() {
  try {
    const posts = await fetchPosts()
    cache = { posts, fetchedAt: Date.now() }
  } catch (e) {
    // Кэш не трогаем: лучше немного устаревший список, чем пустой блог из-за
    // временной недоступности CRM.
    console.warn(`blog-server: обновление списка постов не удалось (${e.message})`)
    if (!cache) throw e
  }
}

/** Отдаёт текущий список постов, обновляя его по TTL. Дедуплицирует параллельные обновления. */
async function getPosts() {
  const stale = !cache || Date.now() - cache.fetchedAt > TTL_MS
  if (stale) {
    inFlight ??= refresh().finally(() => {
      inFlight = null
    })
    if (!cache) await inFlight // холодный старт — ждём первый ответ, отдавать нечего
  }
  return cache?.posts ?? []
}

function send(res, status, body, contentType) {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'public, max-age=30',
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://internal')
    const path = url.pathname.replace(/\/+$/, '') || '/'

    if (path === '/healthz') return send(res, 200, 'ok', 'text/plain; charset=utf-8')

    if (path === '/sitemap.xml') {
      const posts = await getPosts()
      return send(res, 200, renderer.renderSitemap(posts), 'application/xml; charset=utf-8')
    }

    if (path === '/blog') {
      const posts = await getPosts()
      return send(res, 200, renderer.renderIndex(posts), 'text/html; charset=utf-8')
    }

    const match = path.match(/^\/blog\/([^/]+)$/)
    if (match) {
      const slug = decodeURIComponent(match[1])
      let posts = await getPosts()
      let post = posts.find((p) => p.slug === slug)
      // Только что опубликованная статья могла не попасть в текущий кэш —
      // для конкретного адреса, которого нет в списке, одна лишняя сверка с
      // CRM не страшна (это не массовый трафик по /blog/, а единичный запрос
      // на свежепосланную ссылку).
      if (!post) {
        try {
          posts = await fetchPosts()
          cache = { posts, fetchedAt: Date.now() }
          post = posts.find((p) => p.slug === slug)
        } catch {
          /* CRM недоступна — ниже отдаём 404 как обычно */
        }
      }
      if (!post) return send(res, 404, 'Статья не найдена', 'text/plain; charset=utf-8')
      return send(res, 200, renderer.renderArticle(post), 'text/html; charset=utf-8')
    }

    send(res, 404, 'Not found', 'text/plain; charset=utf-8')
  } catch (e) {
    console.error('blog-server: ошибка обработки запроса', e)
    send(res, 503, 'Блог временно недоступен', 'text/plain; charset=utf-8')
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`blog-server: слушает 127.0.0.1:${PORT}, источник постов ${BLOG_API_URL}`)
})
