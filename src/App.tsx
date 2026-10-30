import { useEffect, useState } from 'react'
import { fetchBranding } from '@/lib/api'
import { useTheme, type ThemeMode } from '@/lib/hooks'
import { ADMIN_ROUTE, BROKER_ROUTE, matchesRoute } from '@/lib/routes'
import { useStore } from '@/lib/store'
import { Header } from '@/sections/Header'
import { Hero } from '@/sections/Hero'
import { Development } from '@/sections/Development'
import { QuickAsk } from '@/sections/QuickAsk'
import { Products } from '@/sections/Products'
import { Clients } from '@/sections/Clients'
import { Letters } from '@/sections/Letters'
import { Lead, LeadModal } from '@/sections/Lead'
import { Footer } from '@/sections/Footer'
import { BrokerPage } from '@/broker/BrokerPage'
import { AdminPage } from '@/admin/AdminPage'
import type { SectionId } from '@/types'

function LandingPage({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const { content } = useStore()

  // Порядок и состав секций задаются в админке — рендерим ровно так, как там.
  const RENDERERS: Record<SectionId, () => React.ReactNode> = {
    hero: () => <Hero />,
    development: () => <Development />,
    quick: () => <QuickAsk />,
    products: () => <Products />,
    clients: () => <Clients />,
    letters: () => <Letters />,
    lead: () => <Lead />,
  }

  return (
    <>
      <Header theme={theme} onToggleTheme={onToggleTheme} />
      <main>
        {content.sections
          .filter((section) => section.visible)
          .map((section) => (
            <div key={section.id}>{RENDERERS[section.id]?.()}</div>
          ))}
      </main>
      <Footer />
      <LeadModal />
    </>
  )
}

export default function App() {
  const { theme, toggle } = useTheme()
  const [redirecting, setRedirecting] = useState(false)

  // Партнёрские домены, у которых витрина отключена, ведём сразу на вход в
  // приложение — иначе на чужом бренде появился бы сайт студии.
  useEffect(() => {
    const controller = new AbortController()
    fetchBranding(window.location.host, controller.signal).then((branding) => {
      if (branding && branding.landingEnabled === false) {
        setRedirecting(true)
        window.location.replace('/login')
      }
    })
    return () => controller.abort()
  }, [])

  if (redirecting) return null

  /*
   * Страница про кабинеты застройщика и брокера живёт на отдельном адресе.
   *
   * Свой router сюда не тянем: страниц две, а зависимость обошлась бы в лишний
   * бандл ради одной проверки. Какие адреса обслуживает сам сайт, знает
   * lib/routes — оттуда же ссылки на них собирает store.
   */
  if (matchesRoute(window.location.pathname, BROKER_ROUTE)) {
    return <BrokerPage theme={theme} onToggleTheme={toggle} />
  }

  if (matchesRoute(window.location.pathname, ADMIN_ROUTE)) {
    return <AdminPage />
  }

  return <LandingPage theme={theme} onToggleTheme={toggle} />
}
