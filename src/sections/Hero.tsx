import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'
import { Bloom } from '@/ui/decor'
import { LoopVideo } from '@/ui/LoopVideo'
import { Button, LinkButton, Reveal, RoundButton, SHELL } from '@/ui/primitives'
import { Icon } from '@/ui/Icon'
import type { HeroSlide } from '@/types'

const HERO_IMAGE = `${import.meta.env.BASE_URL}media/hero.webp`

/**
 * Первый экран: заставка студии, под ней — карусель продуктов.
 *
 * Порядок именно такой: человек, открывший сайт впервые, сначала выясняет, кто
 * перед ним, и только потом выбирает продукт. Раньше разговор начинался сразу
 * с конкретной CRM, минуя сам вопрос.
 *
 * Заставка — картинка, а не ролик: кадр статичный, и единственное, что давало
 * видео, — вес в 762 КБ на первом же экране.
 */
export function Hero() {
  const { content } = useStore()
  const { title, subtitle, slides } = content.hero

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Единственный заголовок страницы. Скрыт, потому что нарисован прямо в
          картинке: ни поисковик, ни читалка экрана её не разбирают, а первый
          экран — то место, где сайт называет себя и своё дело. */}
      <h1 className="sr-only">
        {title} — {subtitle}
      </h1>

      <Splash />
      <Carousel slides={slides} />
    </section>
  )
}

/**
 * Заставка во всю ширину.
 *
 * Подложка под картинкой — цвета её краёв: когда экран шире вписанного кадра,
 * по бокам остаётся фон страницы, а он светлее, и первый экран читался
 * картинкой в рамке.
 */
function Splash() {
  const { content, appLink, openLead } = useStore()
  const { title, subtitle, cta, href, highlights } = content.hero

  const action = href ? (
    <LinkButton href={appLink(href)} size="lg" arrow>
      {cta}
    </LinkButton>
  ) : (
    <Button onClick={openLead} size="lg" arrow>
      {cta}
    </Button>
  )

  const alt = `${title}: ${subtitle}`

  return (
    <>
      <div className="hidden bg-[#070e17] sm:block">
        {/*
          Размер задаётся высотой, а не шириной: кадр обязан помещаться на экран
          целиком. От ширины 16:9 на мониторе 1920×1080 даёт 1080 точек высоты,
          и нижний ряд направлений оказывается уже за краем экрана — ровно на
          самом ходовом разрешении. Поэтому берётся меньшее из «во всю ширину» и
          «во весь экран за вычетом шапки», а ширину считает соотношение сторон.
        */}
        <div className="@container relative mx-auto aspect-video h-[min(56.25vw,calc(100svh-5.5rem))]">
          <img
            src={HERO_IMAGE}
            alt={alt}
            // Первый экран: грузится сразу и раньше остального, иначе страница
            // открывается пустым тёмным прямоугольником.
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />

          {/* Доли — с макета, где кнопка и направления стоят на этой же
              картинке: кнопка сразу за светящейся линией под подписью. */}
          <div className="absolute inset-x-0 top-[73.6%] flex -translate-y-1/2 justify-center px-6">{action}</div>

          <ul className="absolute inset-x-0 top-[87%] flex -translate-y-1/2 flex-wrap items-center justify-center px-6">
            {highlights.map((item, index) => (
              <li
                key={item.label}
                className={cn('flex items-center gap-[1.1cqw] px-[1.8cqw]', index > 0 && 'border-l border-mist/15')}
              >
                <Icon name={item.icon} className="size-[clamp(0.9rem,2.1cqw,1.6rem)] text-electric" />
                <span className="text-[clamp(0.68rem,1.05cqw,0.95rem)] leading-tight text-mist">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* На телефоне раскладка другая: во всю ширину нарисованная в кадре
          подпись нечитаема, поэтому картинка идёт отдельно, а подпись, кнопка и
          направления встают под ней столбцом. */}
      <div className="mx-auto max-w-xl px-5 pt-10 sm:hidden">
        <img
          src={HERO_IMAGE}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="block aspect-video w-full rounded-3xl border border-line object-cover"
        />

        <p className="mt-8 text-center text-[length:var(--text-lead)] leading-relaxed text-fg-muted text-pretty">
          {subtitle}
        </p>

        <div className="mt-8 flex justify-center">{action}</div>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5">
          {highlights.map((item) => (
            <li key={item.label} className="flex items-start gap-2.5">
              <Icon name={item.icon} className="mt-0.5 size-4 shrink-0 text-accent-fill" />
              <span className="text-xs leading-snug text-fg-muted">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}

/**
 * Продукты по одному.
 *
 * Компания делает несколько продуктов, и показать их разом значит не показать
 * ни одного: человек читает первые три строки. Поэтому карусель — один продукт
 * за раз, с крупным названием и единственной кнопкой.
 *
 * Листается стрелками под слайдом, точками и клавишами. Автопрокрутки нет: она
 * уводит слайд из-под читающего человека, а здесь на слайде главное действие.
 */
function Carousel({ slides }: { slides: HeroSlide[] }) {
  const { appLink, openLead } = useStore()
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)

  const total = slides.length
  const go = (next: number) => setIndex(((next % total) + total) % total)

  // Стрелки на клавиатуре работают, пока фокус не в форме: тянуться мышью к
  // маленьким кнопкам ради карусели незачем.
  useEffect(() => {
    if (total < 2) return
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') go(index - 1)
      if (e.key === 'ArrowRight') go(index + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, total])

  if (total === 0) return null
  const slide = slides[index]

  return (
    <div className="relative">
      <Bloom className="top-[-18%] right-[-6%]" size={720} opacity={0.2} />
      <Bloom className="bottom-[-24%] left-[-12%]" size={540} opacity={0.1} />

      <div
        className={cn(SHELL, 'relative flex flex-col justify-center py-20')}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          // Свайп: на телефоне стрелки мелкие, а палец по слайду — естественное
          // движение, которого человек ждёт от карусели.
          const start = touchX.current
          touchX.current = null
          if (start === null || total < 2) return
          const delta = (e.changedTouches[0]?.clientX ?? start) - start
          if (Math.abs(delta) < 48) return
          go(delta < 0 ? index + 1 : index - 1)
        }}
      >
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* key на ключевых узлах: при смене слайда появление должно
              проигрываться заново, иначе текст меняется рывком. */}
          <div key={index}>
            <Reveal>
              <p className="eyebrow">
                {String(index + 1).padStart(2, '0')} · {slide.eyebrow}
              </p>
            </Reveal>

            <Reveal delayMs={80}>
              <h2 className="display mt-7 max-w-3xl">{slide.title}</h2>
            </Reveal>

            <Reveal delayMs={160}>
              <p className="mt-7 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-fg-muted text-pretty">
                {slide.text}
              </p>
            </Reveal>

            <Reveal delayMs={240}>
              <div className="mt-10">
                {slide.href ? (
                  <LinkButton href={appLink(slide.href)} size="lg" arrow>
                    {slide.cta}
                  </LinkButton>
                ) : (
                  <Button onClick={openLead} size="lg" arrow>
                    {slide.cta}
                  </Button>
                )}
              </div>
            </Reveal>
          </div>

          <Reveal delayMs={140}>
            <SlideVisual key={index} slide={slide} />
          </Reveal>
        </div>

        {total > 1 && (
          <div className="mt-14 flex items-center gap-5">
            <div className="flex items-center gap-2" role="tablist" aria-label="Продукты">
              {slides.map((item, i) => (
                <button
                  key={item.title}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={item.title}
                  onClick={() => setIndex(i)}
                  className={cn(
                    'h-1.5 rounded-pill transition-all',
                    i === index ? 'w-8 bg-accent-fill' : 'w-1.5 bg-line-strong hover:bg-fg-subtle',
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <RoundButton label="Предыдущий продукт" onClick={() => go(index - 1)}>
                <Icon name="ChevronLeft" className="size-4" />
              </RoundButton>
              <RoundButton label="Следующий продукт" onClick={() => go(index + 1)}>
                <Icon name="ChevronRight" className="size-4" />
              </RoundButton>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Визуал слайда.
 *
 * У слайда либо есть снимок продукта, либо нет. Пока его нет, место занимает
 * фирменный видеоцикл платформы — это не заглушка, а штатное состояние: у
 * части продуктов интерфейса, который можно показать, не будет никогда. Рамка,
 * скругление и размер общие, поэтому слайды не прыгают.
 */
function SlideVisual({ slide }: { slide: HeroSlide }) {
  const [failed, setFailed] = useState(false)
  const src = slide.imageUrlDark || slide.imageUrl
  const show = Boolean(src) && !failed

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="panel overflow-hidden rounded-[2rem] p-3 sm:p-4">
        {show ? (
          <img
            src={src}
            alt={slide.title}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
            className="block aspect-video w-full rounded-3xl border border-line object-cover object-left-top"
          />
        ) : (
          <LoopVideo
            name="products"
            label="Платформа продуктов Gravity"
            className="aspect-video rounded-3xl border border-line"
          />
        )}
      </div>
    </div>
  )
}
