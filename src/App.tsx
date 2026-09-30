import { useEffect, useState } from 'react'
import { fetchBranding } from '@/lib/api'
import { useTheme, type ThemeMode } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import { Header } from '@/sections/Header'
import { Hero } from '@/sections/Hero'
import { Metrics } from '@/sections/Metrics'
import { Features } from '@/sections/Features'
import { Demo } from '@/sections/Demo'
import { Screens } from '@/sections/Screens'
import { Rollout } from '@/sections/Rollout'
import { Faq } from '@/sections/Faq'
import { Lead, LeadModal } from '@/sections/Lead'
import { Footer } from '@/sections/Footer'
import type { SectionId } from '@/types'

function LandingPage({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const { content } = useStore()

  // Порядок и состав секций задаются в админке — рендерим ровно так, как там.
  const RENDERERS: Record<SectionId, () => React.ReactNode> = {
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
