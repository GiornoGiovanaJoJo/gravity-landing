import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'
import { Bloom, GridLines } from '@/ui/decor'
import { GlassSlab, TrajectoryLines } from '@/ui/iridescent'
import { Button, LinkButton, Reveal } from '@/ui/primitives'
import { Icon } from '@/ui/Icon'

/**
 * Первый экран: продукты по одному.
 *
 * Компания делает несколько продуктов, и показать их на первом экране разом
 * значит не показать ни одного: человек приходит за чем-то конкретным и читает
 * первые три строки. Поэтому карусель — один продукт за раз, с крупным
 * названием и единственной кнопкой.
 *
 * Листается стрелками под слайдом, точками и клавишами. Автопрокрутки нет: она
 * уводит слайд из-под читающего человека, а здесь на слайде главное действие
 * страницы.
 *
 * Переключателей направлений («готовые продукты» / «разработка») тут нет
 * намеренно — они уводили внимание от кнопки продукта и дублировали навигацию.
 * Эта развилка живёт ниже, в разделе разработки, где человек уже понимает, из
 * чего выбирает.
 */
export function Hero() {
  const { content, appLink, openLead } = useStore()
  const slides = content.hero.slides
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)

  const total = slides.length
  const go = (next: number) => setIndex(((next % total) + total) % total)

  // Стрелки на клавиатуре работают, пока фокус не в форме: карусель — главный
  // элемент экрана, и тянуться мышью к маленьким кнопкам ради неё незачем.
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
    <section id="top" className="relative overflow-hidden">
      <GridLines />
      <TrajectoryLines className="opacity-70" />
      <Bloom className="top-[-10%] right-[-5%]" size={640} opacity={0.16} />
      <Bloom className="bottom-[-20%] left-[-10%]" size={520} color="var(--irid-1)" opacity={0.1} />

      <div
        className="relative mx-auto flex min-h-[min(760px,82svh)] max-w-7xl flex-col justify-center px-5 pt-14 pb-14 sm:px-8 lg:pt-16"
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
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
          {/* key на ключевых узлах: при смене слайда появление должно
              проигрываться заново, иначе текст меняется рывком. */}
          <div key={index}>
            <Reveal>
              <p className="eyebrow">
                {String(index + 1).padStart(2, '0')} · {slide.eyebrow}
              </p>
            </Reveal>

            <Reveal delayMs={80}>
              <h1 className="display mt-7 max-w-3xl">{slide.title}</h1>
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
                    i === index ? 'w-8 bg-fg' : 'w-1.5 bg-line-strong hover:bg-fg-subtle',
                  )}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <ArrowButton label="Предыдущий продукт" onClick={() => go(index - 1)}>
                <Icon name="ChevronLeft" className="size-4" />
              </ArrowButton>
              <ArrowButton label="Следующий продукт" onClick={() => go(index + 1)}>
                <Icon name="ChevronRight" className="size-4" />
              </ArrowButton>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

/**
 * Снимок продукта в иридесцентной рамке.
 *
 * Пока снимка нет — стеклянный объект и подпись: честная заглушка лучше чужой
 * картинки, а пустое место на первом экране ломает композицию.
 */
function SlideVisual({ slide }: { slide: { title: string; imageUrl: string; imageUrlDark: string } }) {
  const [failed, setFailed] = useState(false)
  const src = slide.imageUrlDark || slide.imageUrl
  const show = src && !failed

  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="hairline surface overflow-hidden rounded-[2rem] p-3 sm:p-4">
        {show ? (
          <img
            src={src}
            alt={slide.title}
            loading="eager"
            decoding="async"
            onError={() => setFailed(true)}
            className="block w-full rounded-3xl border border-line"
          />
        ) : (
          <div className="relative flex aspect-[4/3] items-center justify-center rounded-3xl border border-dashed border-line">
            <GlassSlab className="opacity-90" size={190} seed={20} parallax={10} />
            <span className="mono-label absolute bottom-5">{slide.title}</span>
          </div>
        )}
      </div>
    </div>
  )
}

function ArrowButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="hairline flex size-11 items-center justify-center rounded-full text-fg-muted transition hover:border-line-strong hover:text-fg"
    >
      {children}
    </button>
  )
}
