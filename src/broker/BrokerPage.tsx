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
import { Lead } from './sections/Lead'
import { Footer } from './sections/Footer'
import { StickyCta } from './sections/StickyCta'
import { CookieNotice } from './sections/CookieNotice'
import { initMetrika } from './tracking'
import type { BrokerSectionId } from './types'

/**
 * Страница про кабинеты застройщика и брокера.
 *
 * Отдельная от главной: та рассказывает про студию и весь спектр работ, эта —
 * про один продукт. Смешивать их нельзя, иначе ни одна не продаёт ничего
 * конкретного.
 *
 * Обёртка `broker-theme` переопределяет токены темы для всего поддерева:
 * фирменная палитра ТЗ — белый контент, тёмно-синие акцентные панели, циан на
 * действиях. Класс, а не отдельная сборка: страницы делят один бандл.
 */
export function BrokerPage({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const { content } = useBrokerStore()

  // Счётчик поднимается один раз за жизнь страницы и только если его номер
  // задан при сборке.
  useEffect(() => {
    initMetrika()
  }, [])

  /*
   * Заголовок, описание и Open Graph — свои.
   *
   * index.html один на обе страницы, и без этого и вкладка, и превью ссылки в
   * мессенджере рассказывали бы про студию, хотя человек открыл страницу про
   * кабинеты. Предрендера здесь нет, поэтому краулеры, не исполняющие скрипты,
   * увидят разметку главной — когда это станет важно, страницу нужно будет
   * собирать отдельным входом, а не чинить в этом месте.
   */
  useEffect(() => {
    const title = `${content.hero.titleLines.join(' ')} — ${content.brand.name}`
    const previous: Array<[() => void]> = []

    const setMeta = (selector: string, attribute: string, value: string) => {
      const node = document.head.querySelector(selector)
      if (!node) return
      const before = node.getAttribute(attribute)
      node.setAttribute(attribute, value)
      previous.push([() => (before === null ? node.removeAttribute(attribute) : node.setAttribute(attribute, before))])
    }

    const previousTitle = document.title
    document.title = title
    setMeta('meta[name="description"]', 'content', content.hero.subtitle)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', content.hero.subtitle)

    const canonical = document.createElement('link')
    canonical.rel = 'canonical'
    canonical.href = `${window.location.origin}${window.location.pathname}`
    document.head.appendChild(canonical)

    return () => {
      document.title = previousTitle
      previous.forEach(([restore]) => restore())
      canonical.remove()
    }
  }, [content])

  const RENDERERS: Record<BrokerSectionId, () => React.ReactNode> = {
    hero: () => <Hero />,
    metrics: () => <Metrics />,
    features: () => <Features />,
    demo: () => <Demo />,
    screens: () => <Screens theme={theme} />,
    rollout: () => <Rollout />,
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
      <StickyCta />
      <CookieNotice />
    </div>
  )
}
