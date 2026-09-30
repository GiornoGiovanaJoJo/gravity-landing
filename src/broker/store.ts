import { brokerContent } from './content'
import type { BrokerLandingContent } from './types'

/**
 * Контент страницы про кабинеты застройщика и брокера.
 *
 * В отличие от главной, он не редактируется в админке платформы и не тянется
 * из CRM: документ там один и описывает титульную страницу студии. Страница про
 * отдельный продукт живёт в сборке — её тексты меняются вместе с продуктом, а
 * не отдельно от него.
 *
 * Хук, а не просто импорт, чтобы секции не знали, откуда берётся контент:
 * когда он понадобится из API, поменяется только это место.
 */
export function useBrokerStore(): {
  content: BrokerLandingContent
  appLink: (path: string) => string
} {
  const base = (import.meta.env.VITE_APP_URL ?? '').replace(/\/+$/, '')
  return { content: brokerContent, appLink: (path: string) => `${base}${path}` }
}
