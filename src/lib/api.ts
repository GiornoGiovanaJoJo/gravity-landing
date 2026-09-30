import type { LandingContent } from '@/types'
import { utmValues } from './utm'

/** Пусто = тот же origin. В разработке запросы уходят через прокси Vite на :4000. */
const API = import.meta.env.VITE_API_URL ?? ''

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const res = await fetch(`${API}${path}`, { signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    // Сервер недоступен — не считаем это ошибкой страницы: сайт живёт на дефолтах.
    return null
  }
}

/**
 * Контент, отредактированный админом платформы. null означает «правок нет либо
 * CRM недоступна» — в обоих случаях остаёмся на встроенном content.ts.
 */
export function fetchLandingContent(signal?: AbortSignal) {
  return getJson<Partial<LandingContent> | null>('/api/public/landing', signal)
}

export interface PublicBranding {
  productName: string | null
  logoUrl: string | null
  faviconUrl: string | null
  primaryColor: string | null
  accentColor: string | null
  landingEnabled: boolean
  supportEmail: string | null
  supportPhone: string | null
}

/**
 * Брендинг по текущему домену. Партнёрские домены, у которых лендинг отключён,
 * должны сразу уходить на вход в приложение, а не показывать витрину Gravity.
 */
export function fetchBranding(host: string, signal?: AbortSignal) {
  return getJson<PublicBranding | null>(`/api/public/branding?host=${encodeURIComponent(host)}`, signal)
}

export interface LeadPayload {
  name: string
  phone: string
  email: string
  comment: string
}

export type LeadResult = 'ok' | 'not-configured' | 'error'

/**
 * Отправка заявки через конструктор форм CRM: публичный эндпоинт сам создаёт
 * лид, отсеивает дубли и запускает сценарии автоматизации. Никаких секретов на
 * клиенте — только slug формы.
 */
export async function submitLead(
  formSlug: string,
  payload: LeadPayload,
  extra: Record<string, string> = {},
): Promise<LeadResult> {
  if (!formSlug) return 'not-configured'

  const values: Record<string, string> = {
    name: payload.name,
    phone: payload.phone,
    email: payload.email,
    comment: payload.comment,
    // Источник и метки кампании кладём обычными полями формы — модель Lead
    // отдельных utm-колонок не имеет, и заводить их ради лендинга незачем.
    source: 'Сайт Gravity RPA',
    page: window.location.pathname,
    ...utmValues(),
    ...extra,
  }

  try {
    const res = await fetch(`${API}/api/public/forms/${encodeURIComponent(formSlug)}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ values }),
    })
    if (res.status === 404) return 'not-configured'
    return res.ok ? 'ok' : 'error'
  } catch {
    return 'error'
  }
}
