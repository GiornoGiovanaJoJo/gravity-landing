import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/cn'
import { Icon } from '@/ui/Icon'
import { Card, LinkButton, Reveal, Section } from '@/ui/primitives'
import type { ProductItem } from '@/types'

/**
 * Готовые решения.
 *
 * Лента с прокруткой, а не сетка: продуктов будет больше, чем помещается в
 * экран, и сетка либо растянет страницу на три ряда карточек, либо заставит
 * прятать часть под «показать ещё».
 *
 * Прокрутка настоящая, средствами браузера, а не перестановка элементов
 * скриптом: так работают и колесо мыши, и палец, и клавиатура, и полоса
 * прокрутки — бесплатно и одинаково везде. Стрелки лишь доводят ленту до
 * следующей карточки.
 */
export function Products() {
  const { content, appLink } = useStore()
  const p = content.products
  const trackRef = useRef<HTMLDivElement | null>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const sync = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setAtStart(el.scrollLeft < 8)
    // Два пикселя запаса: дробная ширина карточек не даёт сойтись точно, и
    // кнопка «дальше» оставалась активной в самом конце ленты.
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    sync()
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      el.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [sync, p.items.length])

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.firstElementChild as HTMLElement | null
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8
    el.scrollBy({ left: step * dir, behavior: 'smooth' })
  }

  if (p.items.length === 0) return null

  return (
    <Section id="products">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{p.eyebrow}</p>
          <h2 className="mt-6 text-[length:var(--text-h2)] leading-[1.05] font-light tracking-tight text-balance uppercase">
            {p.title}
          </h2>
          {p.subtitle && <p className="mt-5 max-w-xl text-fg-muted text-pretty">{p.subtitle}</p>}
        </Reveal>

        <Reveal delayMs={80}>
          <div className="flex items-center gap-2">
            <ArrowButton label="Предыдущие решения" onClick={() => scrollBy(-1)} disabled={atStart}>
              <Icon name="ChevronLeft" className="size-4" />
            </ArrowButton>
            <ArrowButton label="Следующие решения" onClick={() => scrollBy(1)} disabled={atEnd}>
              <Icon name="ChevronRight" className="size-4" />
            </ArrowButton>
          </div>
        </Reveal>
      </div>

      <Reveal className="mt-12">
        <div
          ref={trackRef}
          /* scroll-pl повторяет горизонтальный отступ: без него прилипание
             считает началом ленты край контейнера, а не первой карточки, и
             лента сразу уезжала на ширину отступа — кнопка «назад» при этом
             оставалась активной, хотя листать назад уже некуда. */
          className="no-scrollbar -mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:scroll-pl-8 sm:px-8"
          role="group"
          aria-label={p.title}
        >
          {p.items.map((item) => (
            <ProductCard key={item.name} item={item} appLink={appLink} />
          ))}
          {/* Хвостовой отступ: без него последняя карточка упирается в край
              экрана и выглядит обрезанной, хотя лента докручена до конца. */}
          <span aria-hidden="true" className="w-1 shrink-0 sm:w-4" />
        </div>
      </Reveal>

      {p.bannerTitle && (
        <Reveal delayMs={100}>
          <Card className="mt-6 flex flex-wrap items-center justify-between gap-6 p-7 sm:p-9">
            <div>
              <p className="text-xl font-light">{p.bannerTitle}</p>
              {p.bannerText && <p className="mt-2 text-sm text-fg-muted">{p.bannerText}</p>}
            </div>
            {p.bannerCta && p.bannerHref && (
              <LinkButton href={appLink(p.bannerHref)} size="lg" arrow>
                {p.bannerCta}
              </LinkButton>
            )}
          </Card>
        </Reveal>
      )}
    </Section>
  )
}

function ProductCard({ item, appLink }: { item: ProductItem; appLink: (path: string) => string }) {
  const [failed, setFailed] = useState(false)
  const src = item.imageUrlDark || item.imageUrl
  const show = src && !failed

  return (
    <Card
      hoverable
      className="flex w-[min(20rem,78vw)] shrink-0 snap-start flex-col overflow-hidden p-4"
    >
      <div className="overflow-hidden rounded-xl border border-line bg-bg-soft">
        {show ? (
          <img
            src={src}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="block aspect-[16/10] w-full object-cover object-left-top"
          />
        ) : (
          // Снимка нет или он не загрузился — рамка с подписью. Битая картинка
          // схлопывает карточку и перекашивает всю ленту.
          <div className="flex aspect-[16/10] items-center justify-center border border-dashed border-line px-5 text-center">
            <span className="mono-label">{item.name}</span>
          </div>
        )}
      </div>

      <h3 className="mt-5 text-base font-medium">{item.name}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted text-pretty">{item.text}</p>

      {item.href && (
        <a
          href={appLink(item.href)}
          className="group mt-5 inline-flex items-center gap-1.5 text-sm text-fg-muted transition hover:text-fg"
        >
          Подробнее
          <Icon name="ArrowRight" className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      )}
    </Card>
  )
}

function ArrowButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'hairline flex size-11 items-center justify-center rounded-full text-fg-muted transition',
        disabled ? 'opacity-35' : 'hover:border-line-strong hover:text-fg',
      )}
    >
      {children}
    </button>
  )
}
