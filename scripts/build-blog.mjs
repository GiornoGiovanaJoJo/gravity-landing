/**
 * Сборка блога в готовые HTML-страницы.
 *
 * Блог — единственная часть сайта, которая существует ради поисковой выдачи,
 * и поэтому единственная, которую нельзя отдавать как SPA. Остальные страницы
 * собираются в браузере: робот получает пустой `<div id="root">` и заголовок
 * главной, а текст появляется только после исполнения скрипта. Для лендинга
 * это терпимо — его ищут по названию компании, — но статья, которой нет в
 * HTML, не ищется вообще.
 *
 * Поэтому страницы блога не часть React-приложения: скрипт разворачивает
 * markdown из `content/blog` в самостоятельные документы со своими title,
 * description и микроразметкой. Приложение к ним не подключается — грузить
 * бандл ради текста незачем, да и выдача получает ровно то же, что человек.
 *
 * Запускается последним шагом `npm run build`, потому что берёт из готовой
 * сборки адрес CSS: имя файла содержит хеш и меняется от сборки к сборке.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { marked } from 'marked'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT_DIR = join(root, 'content', 'blog')
const DIST = join(root, 'dist')

/** Префикс ассетов. Тот же, с которым собирался Vite, иначе ссылки разъедутся. */
const BASE = process.env.VITE_BASE || '/site/'

/**
 * Домен, по которому страница живёт для поисковика.
 *
 * Нужен для canonical и sitemap — в них адрес обязан быть абсолютным. Сборка,
 * встроенная в CRM, ссылается сюда же: статья одна, и её канонический адрес
 * не зависит от того, с какого хоста её открыли.
 */
const SITE_URL = (process.env.SITE_URL || 'https://g-neuro.space').replace(/\/+$/, '')

const BRAND = 'G-NEURO'
const BLOG_TITLE = 'Блог'
const BLOG_DESCRIPTION =
  'Статьи об автоматизации бизнес-процессов, внедрении CRM и устранении человеческого фактора.'

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch],
  )

/** Адрес внутри сайта с учётом префикса сборки. */
const href = (path) => `${BASE}${String(path).replace(/^\/+/, '')}`

/**
 * Разбор заголовка статьи.
 *
 * Полноценный YAML здесь не нужен: в шапке лежат строки и один список тегов, а
 * парсер ради этого тянул бы зависимость в сборку.
 */
function parseFrontmatter(raw, file) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) throw new Error(`${file}: нет шапки --- в начале файла`)

  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue
    const pair = line.match(/^([a-zA-Z]+):\s*(.*)$/)
    if (!pair) throw new Error(`${file}: не разобрана строка шапки «${line}»`)

    const [, key, value] = pair
    meta[key] = value.startsWith('[')
      ? value
          .slice(1, -1)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : value.replace(/^['"]|['"]$/g, '')
  }

  for (const required of ['title', 'description', 'date']) {
    if (!meta[required]) throw new Error(`${file}: в шапке нет поля ${required}`)
  }

  return { meta, body: match[2] }
}

/** «22 октября 2026» — без «г.», которое locale добавляет сам. */
const formatDate = (iso) =>
  new Date(iso)
    .toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
    .replace(/\s*г\.$/, '')

/** Сколько читать. Считается по словам: 180 слов в минуту — привычная оценка. */
const readingTime = (text) => Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 180))

/**
 * Разметка статьи.
 *
 * Внутренние ссылки в markdown пишутся от корня («/broker»), а жить страница
 * может под префиксом — поэтому их адреса собираются тем же `href`, что и
 * остальные ссылки сайта.
 */
function renderMarkdown(body) {
  const renderer = new marked.Renderer()
  const inherited = renderer.link.bind(renderer)
  renderer.link = (token) => {
    const html = inherited(token)
    return token.href?.startsWith('/') ? html.replace(token.href, href(token.href)) : html
  }
  return marked.parse(body, { renderer, async: false })
}

/** Общий каркас страницы: тема, шрифты и токены берутся у самого сайта. */
function page({ title, description, canonical, jsonLd, content }) {
  const css = cssHref()
  return `<!doctype html>
<html lang="ru" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" type="image/svg+xml" href="${href('favicon.svg')}" />
    <meta name="theme-color" content="#0b1020" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${BRAND}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary_large_image" />

    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>

    ${css ? `<link rel="stylesheet" href="${css}" />` : ''}
    <style>${pageStyles()}</style>

    <!-- Тему человек выбирает на сайте: без этого переход в блог сбрасывал бы
         её на тёмную. Скрипт стоит до разметки, иначе страница успевает
         мигнуть чужим фоном. -->
    <script>
      try {
        var saved = localStorage.getItem('gravity-landing-theme')
        var dark = saved !== 'light'
        document.documentElement.classList.toggle('dark', dark)
        document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
      } catch (e) {}
    </script>
  </head>
  <body>
    <header class="blog-header">
      <a class="blog-brand" href="${href('/')}">${BRAND}</a>
      <nav class="blog-nav" aria-label="Разделы сайта">
        <a href="${href('/')}">На главную</a>
        <a href="${href('/blog/')}">${BLOG_TITLE}</a>
      </nav>
    </header>

    <main class="blog-main">
${content}
    </main>

    <footer class="blog-footer">
      <p>© ${new Date().getFullYear()} ${BRAND}</p>
      <a href="${href('/')}">Вернуться на сайт</a>
    </footer>
  </body>
</html>
`
}

/**
 * Стили страниц блога.
 *
 * Своим файлом, а не классами Tailwind: CSS сайта собирается из `src`, и
 * классы, которых там нет, в него не попадут — вёрстка блога осталась бы
 * голой. Цвета и шрифты при этом общие: токены приходят из того же CSS.
 */
function pageStyles() {
  return `
    body { background: var(--bg); color: var(--fg); font-family: var(--font-sans), system-ui, sans-serif; }
    a { color: inherit; }
    .blog-header, .blog-footer { max-width: 72rem; margin: 0 auto; padding: 1.75rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; flex-wrap: wrap; }
    .blog-header { border-bottom: 1px solid var(--line); }
    .blog-footer { border-top: 1px solid var(--line); color: var(--fg-subtle); font-size: 0.8rem; }
    .blog-brand { font-weight: 600; letter-spacing: -0.01em; font-size: 1.1rem; text-decoration: none; }
    .blog-nav { display: flex; gap: 1.5rem; font-size: 0.9rem; }
    .blog-nav a, .blog-footer a { color: var(--fg-muted); text-decoration: none; transition: color 0.2s; }
    .blog-nav a:hover, .blog-footer a:hover { color: var(--fg); }
    .blog-main { max-width: 46rem; margin: 0 auto; padding: 3.5rem 1.25rem 5rem; }
    .blog-eyebrow { font-size: 0.72rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--fg-subtle); }
    .blog-main h1 { font-size: clamp(2rem, 5vw, 3.1rem); line-height: 1.08; letter-spacing: -0.02em; font-weight: 300; margin: 1.25rem 0 0; text-wrap: balance; }
    .blog-meta { margin-top: 1.25rem; color: var(--fg-subtle); font-size: 0.85rem; }
    .blog-lead { margin-top: 1.5rem; color: var(--fg-muted); font-size: 1.1rem; line-height: 1.6; }
    .blog-article { margin-top: 3rem; font-size: 1.02rem; line-height: 1.75; color: var(--fg-muted); }
    .blog-article h2 { font-size: 1.6rem; line-height: 1.2; letter-spacing: -0.01em; font-weight: 400; color: var(--fg); margin: 3rem 0 1rem; }
    .blog-article h3 { font-size: 1.2rem; font-weight: 500; color: var(--fg); margin: 2.25rem 0 0.75rem; }
    .blog-article p { margin: 1.15rem 0; }
    .blog-article ul, .blog-article ol { margin: 1.15rem 0; padding-left: 1.3rem; }
    .blog-article li { margin: 0.5rem 0; }
    .blog-article strong { color: var(--fg); font-weight: 600; }
    .blog-article a { color: var(--accent); text-decoration: underline; text-underline-offset: 3px; }
    .blog-article code { font-family: var(--font-mono), monospace; font-size: 0.9em; background: var(--bg-soft); padding: 0.1rem 0.35rem; border-radius: 0.3rem; }
    .blog-tags { margin-top: 3rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .blog-tag { font-size: 0.78rem; color: var(--fg-subtle); border: 1px solid var(--line); border-radius: 999px; padding: 0.3rem 0.8rem; }
    .blog-cta { margin-top: 3.5rem; border: 1px solid var(--line); border-radius: 1.5rem; background: var(--bg-soft); padding: 2rem; }
    .blog-cta p { margin: 0 0 1.25rem; color: var(--fg-muted); }
    .blog-cta a { display: inline-block; background: var(--accent-fill); color: #fff; text-decoration: none; border-radius: 999px; padding: 0.75rem 1.75rem; font-size: 0.92rem; }
    .blog-list { list-style: none; margin: 3rem 0 0; padding: 0; }
    .blog-list li + li { margin-top: 1rem; }
    .blog-card { display: block; text-decoration: none; border: 1px solid var(--line); border-radius: 1.5rem; padding: 1.75rem; transition: border-color 0.2s; }
    .blog-card:hover { border-color: var(--accent); }
    .blog-card h2 { font-size: 1.35rem; font-weight: 500; margin: 0.6rem 0 0; color: var(--fg); letter-spacing: -0.01em; }
    .blog-card p { margin: 0.75rem 0 0; color: var(--fg-muted); font-size: 0.95rem; line-height: 1.6; }
  `
}

/** Адрес собранного CSS: имя с хешем лежит в index.html готовой сборки. */
let cachedCss
function cssHref() {
  if (cachedCss !== undefined) return cachedCss
  const html = indexHtml
  cachedCss = html?.match(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/)?.[1] ?? null
  if (!cachedCss) console.warn('build-blog: в dist/index.html нет стилей — страницы блога будут без оформления')
  return cachedCss
}

let indexHtml = null

function renderArticle(post) {
  const url = `${SITE_URL}/blog/${post.slug}/`
  const content = `      <article>
        <p class="blog-eyebrow">${BLOG_TITLE}</p>
        <h1>${escapeHtml(post.meta.title)}</h1>
        <p class="blog-meta">${formatDate(post.meta.date)} · ${post.minutes} мин чтения</p>
        <p class="blog-lead">${escapeHtml(post.meta.description)}</p>
        <div class="blog-article">${post.html}</div>
${
  post.meta.tags?.length
    ? `        <div class="blog-tags">${post.meta.tags
        .map((tag) => `<span class="blog-tag">${escapeHtml(tag)}</span>`)
        .join('')}</div>`
    : ''
}
        <div class="blog-cta">
          <p>Нужна помощь с автоматизацией процессов? Расскажите о задаче — предложим решение.</p>
          <a href="${href('/#lead')}">Обсудить проект</a>
        </div>
      </article>`

  return page({
    title: `${post.meta.title} — ${BRAND}`,
    description: post.meta.description,
    canonical: url,
    content,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.meta.title,
      description: post.meta.description,
      datePublished: post.meta.date,
      dateModified: post.meta.date,
      inLanguage: 'ru-RU',
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      author: { '@type': 'Organization', name: BRAND, url: `${SITE_URL}/` },
      publisher: { '@type': 'Organization', name: BRAND, url: `${SITE_URL}/` },
      keywords: post.meta.tags?.join(', ') || undefined,
    },
  })
}

function renderIndex(posts) {
  const content = `      <p class="blog-eyebrow">${BRAND}</p>
      <h1>${BLOG_TITLE}</h1>
      <p class="blog-lead">${BLOG_DESCRIPTION}</p>
      <ul class="blog-list">
${posts
  .map(
    (post) => `        <li>
          <a class="blog-card" href="${href(`/blog/${post.slug}/`)}">
            <p class="blog-eyebrow">${formatDate(post.meta.date)} · ${post.minutes} мин чтения</p>
            <h2>${escapeHtml(post.meta.title)}</h2>
            <p>${escapeHtml(post.meta.description)}</p>
          </a>
        </li>`,
  )
  .join('\n')}
      </ul>`

  return page({
    title: `${BLOG_TITLE} — ${BRAND}`,
    description: BLOG_DESCRIPTION,
    canonical: `${SITE_URL}/blog/`,
    content,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: `${BLOG_TITLE} — ${BRAND}`,
      description: BLOG_DESCRIPTION,
      url: `${SITE_URL}/blog/`,
      inLanguage: 'ru-RU',
      blogPost: posts.map((post) => ({
        '@type': 'BlogPosting',
        headline: post.meta.title,
        datePublished: post.meta.date,
        url: `${SITE_URL}/blog/${post.slug}/`,
      })),
    },
  })
}

/**
 * Карта сайта.
 *
 * Собирается здесь, а не лежит в `public`: руками её забывают обновить ровно
 * в тот момент, когда появляется новая статья — то есть всегда.
 */
function renderSitemap(posts) {
  const url = (loc, priority, changefreq) =>
    `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`

  const entries = [
    url(`${SITE_URL}/`, '1.0', 'monthly'),
    url(`${SITE_URL}/broker`, '0.9', 'monthly'),
    url(`${SITE_URL}/blog/`, '0.8', 'weekly'),
    ...posts.map(
      (post) =>
        `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}/</loc>\n    <lastmod>${post.meta.date}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
    ),
  ]

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

async function main() {
  if (!existsSync(CONTENT_DIR)) {
    console.log('build-blog: каталога content/blog нет — пропускаем')
    return
  }
  if (!existsSync(DIST)) {
    throw new Error('build-blog: нет каталога dist — запускать после vite build')
  }

  indexHtml = await readFile(join(DIST, 'index.html'), 'utf8')

  const files = (await readdir(CONTENT_DIR)).filter((name) => name.endsWith('.md'))
  const posts = []

  for (const file of files) {
    const raw = await readFile(join(CONTENT_DIR, file), 'utf8')
    const { meta, body } = parseFrontmatter(raw, file)
    posts.push({
      slug: file.replace(/\.md$/, ''),
      meta,
      html: renderMarkdown(body),
      minutes: readingTime(body),
    })
  }

  // Свежие сверху: список читают сверху вниз, и старая статья первой строкой
  // выглядит как заброшенный блог.
  posts.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date))

  if (posts.length === 0) {
    console.log('build-blog: статей нет — страницы не собираются')
    return
  }

  await mkdir(join(DIST, 'blog'), { recursive: true })
  await writeFile(join(DIST, 'blog', 'index.html'), renderIndex(posts))

  for (const post of posts) {
    const dir = join(DIST, 'blog', post.slug)
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'index.html'), renderArticle(post))
  }

  await writeFile(join(DIST, 'sitemap.xml'), renderSitemap(posts))

  console.log(`build-blog: собрано статей — ${posts.length}, карта сайта обновлена`)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
