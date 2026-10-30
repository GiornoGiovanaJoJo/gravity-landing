/**
 * Клиент админки блога.
 *
 * Запросы — относительным `/api/...`, тем же приёмом, что и остальной сайт
 * (`lib/api.ts`): что на standalone-домене (проксируется nginx на CRM), что во
 * встроенной сборке (тот же origin, что у самой CRM) это попадает на бэкенд
 * Gravity RPA без CORS и без отдельного логина.
 *
 * Access-токен живёт 15 минут и хранится в sessionStorage — вкладку закрыли,
 * разлогинились. Продолжает сессию httpOnly refresh-cookie, которую ставит
 * сам логин (`POST /api/auth/refresh` с `credentials: 'include'`): она
 * относится к пути `/api/auth` и без явного домена, поэтому при проксировании
 * браузер привязывает её к текущему хосту — молчаливое обновление токена
 * работает так же, как в самой CRM.
 */

const TOKEN_KEY = 'gn-admin-token'

export class AdminApiError extends Error {
  status: number
  totpRequired?: boolean
  constructor(status: number, message: string, totpRequired?: boolean) {
    super(message)
    this.status = status
    this.totpRequired = totpRequired
  }
}

export function getToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function setToken(token: string | null) {
  try {
    if (token) sessionStorage.setItem(TOKEN_KEY, token)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* приватное окно / блокированное хранилище — сессия просто не переживёт обновление */
  }
}

export interface AdminUser {
  id: string
  name: string
  email: string
}

export interface PlatformAccess {
  level: 'SUPERADMIN' | 'ADMIN' | 'SUPPORT'
  permissions: string[]
}

export interface LoginResult {
  user: AdminUser
  platform: PlatformAccess | null
}

async function parseError(res: Response): Promise<never> {
  let message = 'Не удалось выполнить запрос'
  let totpRequired = false
  try {
    const data = await res.json()
    if (typeof data?.error === 'string') message = data.error
    totpRequired = Boolean(data?.totpRequired)
  } catch {
    /* не JSON */
  }
  throw new AdminApiError(res.status, message, totpRequired)
}

export async function login(email: string, password: string, totpCode?: string): Promise<LoginResult> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password, totpCode: totpCode || undefined }),
  })
  if (!res.ok) return parseError(res)
  const data = await res.json()
  setToken(data.accessToken)
  return { user: data.user, platform: data.platform }
}

/** Восстанавливает user/platform по уже имеющемуся токену — для возврата на страницу внутри сессии. */
export async function me(): Promise<LoginResult> {
  const data = await request<{ accessToken: string; user: AdminUser; platform: PlatformAccess | null }>(
    'GET',
    '/auth/me',
  )
  setToken(data.accessToken)
  return { user: data.user, platform: data.platform }
}

export async function logout() {
  setToken(null)
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  } catch {
    /* токен и так уже сброшен локально */
  }
}

/** Молчаливое обновление access-токена по refresh-cookie. */
async function refresh(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (!res.ok) return false
    const data = await res.json()
    setToken(data.accessToken)
    return true
  } catch {
    return false
  }
}

async function request<T>(method: string, path: string, body?: unknown, form?: FormData): Promise<T> {
  const doFetch = () => {
    const headers: Record<string, string> = {}
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined && !form) headers['Content-Type'] = 'application/json'
    return fetch(`/api${path}`, {
      method,
      headers,
      credentials: 'include',
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
    })
  }

  let res = await doFetch()
  if (res.status === 401 && (await refresh())) {
    res = await doFetch()
  }
  if (!res.ok) return parseError(res)
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export interface BlogPostListItem {
  id: string
  slug: string
  title: string
  description: string
  tags: string[]
  status: 'DRAFT' | 'PUBLISHED'
  coverImageUrl: string | null
  publishedAt: string | null
  updatedAt: string
}

export interface BlogPost extends BlogPostListItem {
  body: string
}

export interface BlogPostInput {
  slug: string
  title: string
  description: string
  tags: string[]
  body: string
  coverImageUrl: string | null
  status: 'DRAFT' | 'PUBLISHED'
  publishedAt: string | null
}

export const blog = {
  list: () => request<BlogPostListItem[]>('GET', '/superadmin/blog'),
  get: (id: string) => request<BlogPost>('GET', `/superadmin/blog/${id}`),
  create: (input: BlogPostInput) => request<BlogPost>('POST', '/superadmin/blog', input),
  update: (id: string, input: BlogPostInput) => request<BlogPost>('PATCH', `/superadmin/blog/${id}`, input),
  remove: (id: string) => request<{ ok: true }>('DELETE', `/superadmin/blog/${id}`),
  uploadCover: (file: File) => {
    const form = new FormData()
    form.append('image', file)
    return request<{ url: string }>('POST', '/superadmin/blog/media', undefined, form)
  },
}
