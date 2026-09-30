import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useBrokerStore } from '../store'

/**
 * Кнопка демо-доступа, видимая на любом экране.
 *
 * Требование ТЗ: основное действие не должно теряться при прокрутке. Появляется
 * после того, как форма первого экрана ушла вверх, и прячется у финального
 * блока — там та же кнопка уже есть, и две подряд читаются как сбой.
 *
 * На мобильном это полоса снизу, на десктопе — кнопка в правом нижнем углу.
 */
export function StickyCta() {
  const { content } = useBrokerStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const hero = document.getElementById('top')
    const lead = document.getElementById('lead')
    if (!hero || typeof IntersectionObserver === 'undefined') return

    const state = { pastHero: false, atLead: false }
    const apply = () => setVisible(state.pastHero && !state.atLead)

    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        state.pastHero = !entry.isIntersecting
        apply()
      },
      { threshold: 0 },
    )
    heroObserver.observe(hero)

    let leadObserver: IntersectionObserver | undefined
    if (lead) {
      leadObserver = new IntersectionObserver(
        ([entry]) => {
          state.atLead = entry.isIntersecting
          apply()
        },
        { threshold: 0.2 },
      )
      leadObserver.observe(lead)
    }

    return () => {
      heroObserver.disconnect()
      leadObserver?.disconnect()
    }
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 px-4 pb-4 transition-all duration-300 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:px-0 sm:pb-0',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
      )}
    >
      <a
        href="#demo"
        className="flex h-12 w-full items-center justify-center rounded-xl bg-accent-fill px-6 text-sm font-semibold text-[#08152b] shadow-lg transition hover:brightness-105 sm:w-auto"
      >
        {content.hero.primaryCta}
      </a>
    </div>
  )
}
