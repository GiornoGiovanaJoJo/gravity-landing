import { useEffect, useState } from 'react'
import { fetchBranding } from '@/lib/api'
import { useTheme, type ThemeMode } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import { Header } from '@/sections/Header'
import { Hero } from '@/sections/Hero'
import { Ticker } from '@/sections/Ticker'
import { Services } from '@/sections/Services'
import { About } from '@/sections/About'
import { Process } from '@/sections/Process'
import { Industries } from '@/sections/Industries'
import { Product } from '@/sections/Product'
import { Plans } from '@/sections/Plans'
import { Cta } from '@/sections/Cta'
import { Reviews } from '@/sections/Reviews'
import { Clients } from '@/sections/Clients'
import { Faq } from '@/sections/Faq'
import { Lead, LeadModal } from '@/sections/Lead'
import { Footer } from '@/sections/Footer'
import type { SectionId } from '@/types'

function LandingPage({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const { content } = useStore()

  // Порядок и состав секций задаются в админке — рендерим ровно так, как там.
  const RENDERERS: Record<SectionId, () => React.ReactNode> = {
    hero: () => <Hero />,
    ticker: () => <Ticker />,
    services: () => <Services />,
    about: () => <About />,
    process: () => <Process />,
    industries: () => <Industries />,
    product: () => <Product />,
    plans: () => <Plans />,
    cta: () => <Cta />,
    reviews: () => <Reviews />,
    clients: () => <Clients />,
    faq: () => <Faq />,
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

  return <LandingPage theme={theme} onToggleTheme={toggle} />
}
