import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useInView, usePrefersReducedMotion } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import { Button, LinkButton, Reveal, Section } from '@/ui/primitives'
import type { DevelopmentItem } from '@/types'

const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`

/** Фрагменты кода на фоне сцены: смысла не несут, задают среду. */
const CODE = [
  { text: '< possibility />', top: '6%', left: '62%', dx: '26px', dy: '-34px', delay: '0s', duration: '12s' },
  { text: 'const future = build()', top: '18%', left: '2%', dx: '-18px', dy: '-28px', delay: '1.6s', duration: '13s' },
  { text: 'neural.connect()', top: '26%', left: '72%', dx: '22px', dy: '-30px', delay: '3.1s', duration: '11s' },
  { text: '{ intelligence: true }', top: '45%', left: '0%', dx: '-24px', dy: '-22px', delay: '4.4s', duration: '14s' },
  { text: 'await evolve();', top: '56%', left: '70%', dx: '18px', dy: '-26px', delay: '2.3s', duration: '12s' },
  { text: 'data.flow', top: '72%', left: '4%', dx: '-20px', dy: '-30px', delay: '5.5s', duration: '11s' },
]

/**
 * Индивидуальная разработка.
 *
 * Раздел назывался «IT-решения для вашего бизнеса», а соседний — «Наши
 * продукты», и отличить их было нельзя: оба про IT и оба про бизнес. Теперь
 * названия говорят, чем они отличаются на самом деле: здесь делают под задачу,
 * там берут готовое.
 *
 * Композиция из макета: шесть направлений двумя колонками, между ними киборг.
 * Направление выбирается наведением, щелчком, точками или клавишами, и выбор
 * подсвечивает значок, номер и связь со сценой.
 *
 * Колесо мыши здесь ничего не переключает, хотя в макете переключало. Перехват
 * прокрутки на длинной странице означает, что человек, листающий к контактам,
 * залипает в середине и не понимает, почему страница не едет. Вместо него —
 * автопоказ: он даёт то же «блок живой», но не отнимает управление.
 */
export function Development() {
  const { content, openLead } = useStore()
  const d = content.development
  const items = d.items

  const reduced = usePrefersReducedMotion()
  const { ref: sceneRef, inView } = useInView<HTMLDivElement>()

  const [active, setActive] = useState(0)
  // Автопоказ сам останавливается при первом же действии человека: он нужен,
  // чтобы блок не выглядел мёртвым, а не чтобы спорить с выбором.
  const [auto, setAuto] = useState(true)

  const select = useCallback(
    (next: number) => {
      setAuto(false)
      setActive(((next % items.length) + items.length) % items.length)
    },
    [items.length],
  )

  useEffect(() => {
    if (!auto || !inView || reduced || items.length < 2) return
    const timer = setInterval(() => {
      if (!document.hidden) setActive((i) => (i + 1) % items.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [auto, inView, reduced, items.length])

  if (items.length === 0) return null

  const split = Math.ceil(items.length / 2)
  const left = items.slice(0, split)
  const right = items.slice(split)

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]
    if (step === undefined) return
    e.preventDefault()
    select(active + step)
  }

  return (
    <Section id="development" className="overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{d.eyebrow}</p>
          <h2 className="mt-6 text-[length:var(--text-h3)] leading-[1.1] font-light tracking-tight text-balance">
            {d.title}
          </h2>
          {d.subtitle && <p className="mt-5 max-w-xl text-fg-muted text-pretty">{d.subtitle}</p>}
        </Reveal>

        {/* Счётчик направлений — деталь широкой раскладки: на телефоне он
            встаёт отдельной строкой между подзаголовком и сценой и читается
            как оборванный заголовок. */}
        <Reveal delayMs={60} className="hidden lg:block">
          <p className="mono-label whitespace-nowrap">
            {content.brand.name} / {String(items.length).padStart(2, '0')}
          </p>
        </Reveal>
      </div>

      <div
        ref={sceneRef}
        role="group"
        aria-label={d.title}
        onKeyDown={onKeyDown}
        className="relative mt-12 grid gap-10 lg:mt-4 lg:grid-cols-[1fr_minmax(300px,24rem)_1fr] lg:items-center lg:gap-6"
      >
        {/* Киборг первым в разметке и вторым в сетке: на узком экране он
            открывает блок, как в мобильной версии макета, а на широком
            встаёт между колонками. */}
        <Character
          items={items}
          active={active}
          auto={auto}
          reduced={reduced}
          onSelect={select}
          onToggleAuto={() => setAuto((v) => !v)}
          className="lg:order-2"
        />

        <ul className="grid gap-10 sm:grid-cols-2 lg:order-1 lg:grid-cols-1 lg:gap-12">
          {left.map((item, i) => (
            <Direction
              key={item.title}
              item={item}
              index={i}
              active={active === i}
              side="left"
              onSelect={select}
            />
          ))}
        </ul>

        <ul className="grid gap-10 sm:grid-cols-2 lg:order-3 lg:grid-cols-1 lg:gap-12">
          {right.map((item, i) => (
            <Direction
              key={item.title}
              item={item}
              index={split + i}
              active={active === split + i}
              side="right"
              onSelect={select}
            />
          ))}
        </ul>
      </div>

      <Reveal delayMs={100}>
        <div className="mt-14 grid gap-3 sm:grid-cols-2">
          <Button onClick={openLead} size="lg" className="w-full" arrow>
            {d.primaryCta}
          </Button>
          <LinkButton href="#products" variant="outline" size="lg" className="w-full">
            {d.secondaryCta}
          </LinkButton>
        </div>
      </Reveal>
    </Section>
  )
}

/**
 * Направление разработки.
 *
 * Значок всегда со стороны киборга: в левой колонке справа от текста, в правой
 * — слева. Так шесть значков смотрят в центр и собирают композицию, а не
 * расползаются по краям экрана.
 */
function Direction({
  item,
  index,
  active,
  side,
  onSelect,
}: {
  item: DevelopmentItem
  index: number
  active: boolean
  side: 'left' | 'right'
  onSelect: (index: number) => void
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        onMouseEnter={() => onSelect(index)}
        onFocus={() => onSelect(index)}
        onClick={() => onSelect(index)}
        /*
         * Невыбранное направление приглушено значком и заголовком, а не
         * прозрачностью всей карточки, как в макете: прозрачность съедает
         * контраст описания, и на светлой теме оно перестаёт проходить по
         * читаемости. Описание обязано читаться у всех шести сразу — ради
         * него человек и смотрит на блок.
         */
        className="flex w-full items-start gap-4 text-left"
      >
        {/* Порядок задаётся order, а не двумя копиями разметки: значку нужно
            стоять со стороны киборга, а киборг на узком экране сверху, а на
            широком — сбоку. */}
        <span
          className={cn(
            'relative order-2 flex shrink-0 items-center',
            side === 'left' ? 'ml-auto' : 'lg:order-1 lg:ml-0',
            side === 'right' && 'ml-auto',
          )}
        >
          <img
            src={media(`solutions/icon-0${(index % 6) + 1}.svg`)}
            alt=""
            width={54}
            height={54}
            loading="lazy"
            className={cn(
              'size-12 transition duration-500 sm:size-14',
              active ? 'drop-shadow-[0_0_9px_rgba(46,134,222,0.55)]' : 'opacity-80',
            )}
          />
          {/* Связь со сценой: короткий пунктир, который «течёт», пока
              направление выбрано. Рисуется только там, где рядом есть центр, —
              на узких экранах киборг стоит выше, и линия вела бы в пустоту. */}
          <span
            aria-hidden="true"
            className={cn(
              'absolute hidden h-px w-14 transition-opacity duration-500 lg:block',
              side === 'left' ? 'left-full ml-3' : 'right-full mr-3',
              active ? 'opacity-100' : 'opacity-25',
            )}
          >
            <svg viewBox="0 0 56 2" className="size-full overflow-visible" preserveAspectRatio="none">
              <path
                d="M0 1H56"
                stroke="var(--electric)"
                strokeWidth="1"
                strokeDasharray="6 7"
                className={cn(active && 'animate-link-flow')}
              />
            </svg>
          </span>
        </span>

        <span className={cn('order-1 block', side === 'right' && 'lg:order-2')}>
          <span className={cn('mono-label block transition-colors duration-500', active && 'text-accent')}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span
            className={cn(
              'mt-4 block text-lg font-normal transition-colors duration-500 sm:text-xl',
              active ? 'text-fg' : 'text-fg/70',
            )}
          >
            {item.title}
          </span>
          <span className="mt-2.5 block text-sm leading-relaxed text-fg-muted text-pretty">{item.text}</span>
        </span>
      </button>
    </li>
  )
}

/** Центр сцены: киборг, фон из кода, подпись выбранного направления и точки. */
function Character({
  items,
  active,
  auto,
  reduced,
  onSelect,
  onToggleAuto,
  className,
}: {
  items: DevelopmentItem[]
  active: number
  auto: boolean
  reduced: boolean
  onSelect: (index: number) => void
  onToggleAuto: () => void
  className?: string
}) {
  return (
    <div className={cn('relative mx-auto w-full max-w-sm lg:max-w-none', className)}>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[-20%] top-[6%] bottom-[18%] rounded-full bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--electric)_26%,transparent)_0%,transparent_68%)] blur-xl"
        />

        {!reduced &&
          CODE.map((fragment) => (
            <span
              key={fragment.text}
              aria-hidden="true"
              className="animate-code-drift pointer-events-none absolute font-mono text-[11px] whitespace-nowrap text-fg-muted"
              style={
                {
                  top: fragment.top,
                  left: fragment.left,
                  '--dx': fragment.dx,
                  '--dy': fragment.dy,
                  '--code-delay': fragment.delay,
                  '--code-duration': fragment.duration,
                } as React.CSSProperties
              }
            >
              {fragment.text}
            </span>
          ))}

        <img
          src={media('solutions/character.webp')}
          alt="Киборг: фирменный образ направлений разработки"
          width={840}
          height={1260}
          loading="lazy"
          decoding="async"
          className={cn(
            'relative mx-auto block w-full max-w-[22rem] [mask-image:linear-gradient(to_bottom,#000_72%,transparent_100%)]',
            !reduced && 'animate-breathe',
          )}
        />

        {!reduced && (
          <span
            aria-hidden="true"
            className="animate-scan pointer-events-none absolute inset-x-[14%] top-[8%] h-px bg-[linear-gradient(to_right,transparent,var(--electric),transparent)]"
            style={{ ['--scan-distance' as string]: '320px' }}
          />
        )}
      </div>

      <p className="mono-label mt-2 text-center text-fg">{items[active]?.title}</p>

      <div className="mt-5 flex items-center justify-center gap-3">
        {items.map((item, i) => (
          <button
            key={item.title}
            type="button"
            aria-label={item.title}
            aria-pressed={i === active}
            onClick={() => onSelect(i)}
            className={cn(
              'size-2.5 rounded-full transition',
              i === active ? 'scale-125 bg-accent-fill' : 'bg-line-strong hover:bg-fg-subtle',
            )}
          />
        ))}
      </div>

      {!reduced && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            aria-pressed={auto}
            onClick={onToggleAuto}
            className="mono-label transition hover:text-fg"
          >
            {auto ? 'Остановить ‖' : 'Автопоказ ▷'}
          </button>
        </div>
      )}
    </div>
  )
}
