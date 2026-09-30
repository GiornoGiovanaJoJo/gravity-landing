import { useEffect } from 'react'
import type { ThemeMode } from '@/lib/hooks'
import { useBrokerStore } from './store'
import { Header } from './sections/Header'
import { Hero } from './sections/Hero'
import { Metrics } from './sections/Metrics'
import { Features } from './sections/Features'
import { Demo } from './sections/Demo'
import { Screens } from './sections/Screens'
import { Rollout } from './sections/Rollout'
import { Faq } from './sections/Faq'
import { Lead } from './sections/Lead'
import { Footer } from './sections/Footer'
import type { BrokerSectionId } from './types'

/**
 * Страница про кабинеты застройщика и брокера.
 *
 * Отдельная от главной: та рассказывает про студию и весь спектр работ, эта —
 * про один продукт. Смешивать их нельзя, иначе ни одна не продаёт ничего
 * конкретного.
 *
 * Обёртка `broker-theme` переопределяет токены темы для всего поддерева:
 * тёмно-синяя база вместо чёрной и мятный акцент. Класс, а не отдельная
 * сборка, — страницы делят один бандл и одну сборку стилей.
 */
export function BrokerPage({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const { content } = useBrokerStore()

  /*
   * Заголовок и описание вкладки — свои.
   *
   * index.html один на обе страницы, и без этого и вкладка, и превью ссылки в
   * мессенджере рассказывали бы про студию, хотя человек открыл страницу про
   * кабинеты. Разметку для поисковиков это не заменяет — до отдельного
   * пререндера её тут и нет, — но вкладку и шеринг чинит.
   */
  useEffect(() => {
    const previousTitle = document.title
    document.title = `${content.hero.titleLines.join(' ')} — ${content.brand.name}`
    const meta = document.querySelector('meta[name="description"]')
    const previousDescription = meta?.getAttribute('content') ?? null
    meta?.setAttribute('content', content.hero.subtitle)
    return () => {
      document.title = previousTitle
      if (previousDescription !== null) meta?.setAttribute('content', previousDescription)
    }
  }, [content])

  const RENDERERS: Record<BrokerSectionId, () => React.ReactNode> = {
    hero: () => <Hero />,
    metrics: () => <Metrics />,
    features: () => <Features />,
    demo: () => <Demo />,
    screens: () => <Screens />,
    rollout: () => <Rollout />,
    faq: () => <Faq />,
    lead: () => <Lead />,
  }

  return (
    <div className="broker-theme bg-bg text-fg">
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        {content.sections
          .filter((section) => section.visible)
          .map((section) => (
            <div key={section.id}>{RENDERERS[section.id]?.()}</div>
          ))}
      </main>
      <Footer />
    </div>
  )
}
