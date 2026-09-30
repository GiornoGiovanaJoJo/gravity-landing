const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

const STORE_KEY = 'gravity-landing-utm'

type Utm = Partial<Record<(typeof KEYS)[number] | 'referrer' | 'landing_page', string>>

/**
 * Запоминает метки кампании при первом заходе.
 *
 * Читать их из адресной строки в момент отправки недостаточно: человек
 * приходит по ссылке с метками, ходит по якорям, иногда открывает политику и
 * возвращается — и заявка уезжает уже без source. Первый набор меток за сессию
 * не перезаписывается: он и есть тот переход, который привёл человека.
 */
export function captureUtm() {
  if (typeof sessionStorage === 'undefined') return
  if (sessionStorage.getItem(STORE_KEY)) return

  const params = new URLSearchParams(window.location.search)
  const found: Utm = {}
  for (const key of KEYS) {
    const value = params.get(key)
    if (value) found[key] = value.slice(0, 200)
  }
  if (Object.keys(found).length === 0) return

  found.landing_page = window.location.pathname
  if (document.referrer) found.referrer = document.referrer.slice(0, 300)
  sessionStorage.setItem(STORE_KEY, JSON.stringify(found))
}

/** Сохранённые метки, а если их нет — те, что видны в адресе прямо сейчас. */
export function utmValues(): Record<string, string> {
  if (typeof sessionStorage !== 'undefined') {
    const raw = sessionStorage.getItem(STORE_KEY)
    if (raw) {
      try {
        return JSON.parse(raw) as Record<string, string>
      } catch {
        // Битое значение — ведём себя так, будто меток нет.
      }
    }
  }

  const params = new URLSearchParams(window.location.search)
  const out: Record<string, string> = {}
  for (const key of KEYS) {
    const value = params.get(key)
    if (value) out[key] = value
  }
  return out
}
