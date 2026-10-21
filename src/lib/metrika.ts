/**
 * Счётчик Яндекс.Метрики и цели для веб-аналитики.
 *
 * Обёртка, а не прямые вызовы ym по коду: счётчика может не быть вовсе (в
 * разработке он намеренно выключен), и страницы обязаны работать без него.
 * Заодно имена целей собраны в одном месте — именно они настраиваются в
 * Метрике, и расходиться с кодом им нельзя.
 */

export type Goal =
  | 'demo_form_open'
  | 'demo_form_submit'
  | 'demo_lead_sent'
  | 'deck_download'
  | 'deck_email_submit'
  | 'screens_slide'
  | 'analytics_seen'

declare global {
  interface Window {
    ym?: (id: number, action: string, ...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

const COUNTER = Number(import.meta.env.VITE_YM_ID ?? 0) || 0

export function track(goal: Goal, params?: Record<string, unknown>) {
  if (COUNTER && typeof window.ym === 'function') window.ym(COUNTER, 'reachGoal', goal, params)
  window.dataLayer?.push({ event: goal, ...params })
}

/**
 * Подключает счётчик, если его номер задан при сборке.
 *
 * Скрипт вставляется из кода, а не из index.html: номер приходит переменной
 * окружения, и в разметке его пришлось бы держать заглушкой. Так же решается
 * главное — на `npm run dev` переменной нет, и отладочные визиты не попадают
 * в статистику вместе с настоящими.
 */
export function initMetrika() {
  if (!COUNTER || document.getElementById('ym-script')) return

  window.ym =
    window.ym ??
    ((...args: unknown[]) => {
      ;(window.ym as unknown as { a: unknown[] }).a ??= []
      ;(window.ym as unknown as { a: unknown[] }).a.push(args)
    })
  ;(window.ym as unknown as { l: number }).l = Date.now()

  const script = document.createElement('script')
  script.id = 'ym-script'
  script.async = true
  script.src = `https://mc.yandex.ru/metrika/tag.js?id=${COUNTER}`
  document.head.appendChild(script)

  /*
   * Без `defer`: с ним Метрика ждёт ручного `ym('hit')`, которого в коде нет,
   * и просмотры не отправлялись совсем — оставался только счётчик без визитов.
   *
   * ecommerce указывает на тот же dataLayer, в который пишет track(), — одна
   * очередь событий на оба канала.
   */
  window.ym(COUNTER, 'init', {
    ssr: true,
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    ecommerce: 'dataLayer',
    referrer: document.referrer,
    url: location.href,
  })
}
