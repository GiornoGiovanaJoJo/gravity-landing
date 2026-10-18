import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'
import { Bloom } from '@/ui/decor'
import { LoopVideo } from '@/ui/LoopVideo'
import { Button, LinkButton, Reveal, RoundButton } from '@/ui/primitives'
import { Icon } from '@/ui/Icon'
import type { HeroSlide } from '@/types'

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
      <Bloom className="top-[-18%] right-[-6%]" size={720} opacity={0.2} />
      <Bloom className="bottom-[-24%] left-[-12%]" size={540} opacity={0.1} />

      <div
        className="relative mx-auto flex min-h-[min(780px,86svh)] max-w-7xl flex-col justify-center px-5 pt-12 pb-16 sm:px-8"
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
    </section>
  )
}

/**
 * Визуал слайда.
 *
 * У слайда либо есть снимок продукта, либо нет. Пока его нет, место занимает
 * фирменный видеоцикл макета — это не заглушка, а штатное состояние первого
 * экрана: у части продуктов интерфейса, который можно показать, не будет
 * никогда. Рамка, скругление и размер общие, поэтому слайды не прыгают.
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
            loading="eager"
            decoding="async"
            onError={() => setFailed(true)}
            className="block aspect-square w-full rounded-3xl border border-line object-cover object-left-top"
          />
        ) : (
          <LoopVideo
            name="hero"
            label="Киборг в потоке программного кода"
            className="aspect-square rounded-3xl border border-line"
            objectPosition="center 34%"
          />
        )}
      </div>
    </div>
  )
}
