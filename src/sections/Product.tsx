import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'
import { Icon } from '@/ui/Icon'
import { Bloom } from '@/ui/decor'
import { ProductMock } from '@/ui/mocks'
import { Button, Eyebrow, LinkButton, Reveal, Section } from '@/ui/primitives'

/**
 * Собственный продукт студии.
 *
 * Идёт после услуг намеренно: сайт сначала продаёт работу под задачу, и только
 * потом предлагает готовую платформу как быстрый старт. Вкладки — настоящий
 * tablist с управлением стрелками, а не переключение скрытых радиокнопок.
 */
export function Product() {
  const { content, appLink, openLead } = useStore()
  const product = content.product
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) return
    e.preventDefault()
    const last = product.tabs.length - 1
    const next =
      e.key === 'Home'
        ? 0
        : e.key === 'End'
          ? last
          : e.key === 'ArrowRight'
            ? (active + 1) % product.tabs.length
            : (active + last) % product.tabs.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const tab = product.tabs[active]
  if (!tab) return null

  return (
    // overflow-hidden обязателен: свечение ниже шире узкого экрана, и без
    // обрезки страница разъезжается вбок.
    <Section id="product" className="relative overflow-hidden border-y border-line">
      <Bloom className="top-0 left-1/2 -translate-x-1/2" size={720} opacity={0.12} />

      <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <Reveal>
          <Eyebrow>{product.eyebrow}</Eyebrow>
          <h2 className="mt-5 text-[length:var(--text-h1)] leading-[1] font-light tracking-tight uppercase">
            {product.title}
          </h2>
          <p className="mt-5 max-w-2xl text-fg-muted text-pretty">{product.subtitle}</p>
        </Reveal>

        <Reveal delayMs={100} className="flex flex-wrap gap-3">
          <LinkButton href={appLink('/register')} arrow>
            {product.primaryCta}
          </LinkButton>
          <Button onClick={openLead} variant="outline">
            {product.secondaryCta}
          </Button>
        </Reveal>
      </div>

      <Reveal className="mt-12">
        <div
          role="tablist"
          aria-label="Возможности продукта"
          onKeyDown={onKeyDown}
          className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0"
        >
          {product.tabs.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              role="tab"
              type="button"
              id={`product-tab-${item.id}`}
              aria-selected={i === active}
              aria-controls={`product-panel-${item.id}`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-pill px-4 py-2.5 text-sm transition',
                i === active ? 'bg-fg text-bg' : 'hairline surface text-fg-muted hover:text-fg',
              )}
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
      </Reveal>

      <div
        role="tabpanel"
        id={`product-panel-${tab.id}`}
        aria-labelledby={`product-tab-${tab.id}`}
        className="mt-12 grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
      >
        {/* key перезапускает появление при переключении вкладки. */}
        <Reveal key={`${tab.id}-text`}>
          <h3 className="text-2xl font-light tracking-tight text-balance sm:text-3xl">{tab.title}</h3>
          <p className="mt-4 text-fg-muted text-pretty">{tab.text}</p>
          <ul className="mt-8 space-y-3">
            {tab.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-3 text-sm">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span className="text-fg-muted">{bullet}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal key={`${tab.id}-mock`} delayMs={80}>
          <ProductMock kind={tab.mock} />
        </Reveal>
      </div>
    </Section>
  )
}
