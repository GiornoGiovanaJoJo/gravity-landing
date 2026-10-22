import { useCallback, useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { Icon } from '@/ui/Icon'
import { LoopVideo } from '@/ui/LoopVideo'
import { Card, LinkButton, Reveal, RoundButton, Section } from '@/ui/primitives'
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
    <Section id="products" className="border-t border-line">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{p.eyebrow}</p>
          <h2 className="display-sm mt-6 text-balance">{p.title}</h2>
          {p.subtitle && <p className="mt-5 max-w-xl text-fg-muted text-pretty">{p.subtitle}</p>}
        </Reveal>

        <Reveal delayMs={80}>
          <div className="flex items-center gap-2">
            <RoundButton label="Предыдущие решения" onClick={() => scrollBy(-1)} disabled={atStart}>
              <Icon name="ChevronLeft" className="size-4" />
            </RoundButton>
            <RoundButton label="Следующие решения" onClick={() => scrollBy(1)} disabled={atEnd}>
              <Icon name="ChevronRight" className="size-4" />
            </RoundButton>
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
          className="no-scrollbar bleed-x flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto pb-2 sm:scroll-pl-8"
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
          <PlatformBanner
            title={p.bannerTitle}
            text={p.bannerText}
            cta={p.bannerCta}
            href={p.bannerHref && appLink(p.bannerHref)}
          />
        </Reveal>
      )}
    </Section>
  )
}

/**
 * Единый вход во все продукты.
 *
 * Акцентная рамка и видео в центре: в макете это самый «громкий» объект
 * раздела, и он же — единственное место, где из витрины продуктов можно уйти
 * в саму платформу.
 */
function PlatformBanner({
  title,
  text,
  cta,
  href,
}: {
  title: string
  text: string
  cta: string
  href: string
}) {
  return (
    <div className="mt-8 grid items-center gap-8 rounded-card border border-accent/45 bg-[linear-gradient(140deg,color-mix(in_oklab,var(--electric)_14%,transparent),var(--panel))] p-7 sm:p-9 lg:grid-cols-[1fr_auto_auto] lg:gap-10">
      <div>
        <p className="text-2xl leading-tight font-light text-balance">{title}</p>
        {text && <p className="mt-3 text-sm text-fg-muted text-pretty">{text}</p>}
      </div>

      <LoopVideo
        name="products"
        label="Лицо из жидкого хрома"
        className="aspect-square w-full max-w-[13rem] rounded-2xl border border-line lg:w-52"
      />

      {cta && href && (
        <LinkButton href={href} size="lg" arrow className="w-full lg:w-auto">
          {cta}
        </LinkButton>
      )}
    </div>
  )
}

function ProductCard({ item, appLink }: { item: ProductItem; appLink: (path: string) => string }) {
  const [failed, setFailed] = useState(false)
  const src = item.imageUrlDark || item.imageUrl
  const show = Boolean(src) && !failed

  return (
    <Card hoverable className="flex w-[min(21rem,80vw)] shrink-0 snap-start flex-col overflow-hidden p-4">
      <div className="overflow-hidden rounded-xl border border-line bg-bg">
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

      <h3 className="mt-5 font-mono text-[15px] tracking-[0.03em]">{item.name}</h3>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-fg-muted text-pretty">{item.text}</p>

      {item.href && (
        /*
         * Новой вкладкой: человек изучает витрину и сравнивает продукты, и уход
         * с неё означает, что к остальным он возвращается кнопкой «назад».
         *
         * rel только noopener, без noreferrer: открывшаяся страница не должна
         * иметь доступа к этой, но источник перехода нужен — по нему в CRM
         * видно, что человек пришёл с сайта.
         *
         * Стрелка по диагонали, а не вправо: это тот же знак, которым в макете
         * помечен уход со страницы, и он предупреждает о новой вкладке раньше
         * нажатия. Для тех, кто ссылку не видит, об этом говорит aria-label —
         * заодно он отличает четыре одинаковых «Подробнее» друг от друга.
         */
        <a
          href={appLink(item.href)}
          target="_blank"
          rel="noopener"
          aria-label={`Подробнее о продукте «${item.name}» — откроется в новой вкладке`}
          className="group mt-5 inline-flex items-center gap-1.5 text-sm text-fg-muted transition hover:text-fg"
        >
          Подробнее
          <span aria-hidden="true" className="transition-transform group-hover:-translate-y-0.5">
            ↗
          </span>
        </a>
      )}
    </Card>
  )
}
