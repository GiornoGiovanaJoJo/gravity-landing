import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'
import { Bloom } from '@/ui/decor'
import { HeroScene } from '@/ui/HeroScene'
import { LoopVideo } from '@/ui/LoopVideo'
import { Button, LinkButton, Reveal, RoundButton, SHELL } from '@/ui/primitives'
import { Icon } from '@/ui/Icon'
import type { HeroSlide } from '@/types'

/**
 * Первый экран: заставка студии, под ней — карусель продуктов.
 *
 * Порядок именно такой: человек, открывший сайт впервые, сначала выясняет, кто
 * перед ним, и только потом выбирает продукт. Раньше разговор начинался сразу
 * с конкретной CRM, минуя сам вопрос.
 */
export function Hero() {
  const { content } = useStore()

  return (
    <section id="top" className="relative overflow-hidden">
      <Splash />
      <Carousel slides={content.hero.slides} />
    </section>
  )
}

/**
 * Заставка во всю ширину: векторная сцена, поверх — живой текст.
 *
 * Раскладка одна на все экраны. Пока заголовок был нарисован внутри картинки,
 * телефону приходилось отдавать отдельный блок: во всю ширину вшитая в кадр
 * подпись становилась нечитаемой. Текст, набранный шрифтом, масштабируется сам,
 * и вторая раскладка отпала вместе с ним.
 *
 * По той же причине исчезли доли и проценты: элементы больше не целятся в
 * участки картинки, а просто идут столбцом по центру.
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

  return (
    <div className="relative isolate">
      <HeroScene className="absolute inset-0 -z-20 size-full" />

      {/*
        Тёмное «озеро» под текстом.

        Затемнение живёт здесь, а не внутри сцены, потому что сцена
        масштабируется под пропорции экрана, а текст — нет: на узком экране
        крылья сходились ровно там, где идёт подпись, и читать её было нельзя.
        Слой же всегда накрывает ровно то место, где стоит текст.
      */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(58%_46%_at_50%_54%,#050b17_0%,color-mix(in_oklab,#050b17_82%,transparent)_45%,transparent_100%)]"
      />

      <div
        className={cn(
          SHELL,
          'flex min-h-[min(44rem,calc(100svh-5.5rem))] flex-col items-center justify-center py-16 text-center sm:py-20',
        )}
      >
        {/*
          Единственный заголовок страницы. Раньше он был вшит в пиксели кадра, и
          рядом приходилось держать скрытую копию — иначе ни поисковик, ни
          читалка экрана не узнали бы, чей это сайт.
        */}
        {/* Знак набирается из самого названия, а не вписан в разметку: имя
            компании приходит из контента и может смениться в админке. Первая
            буква — фирменная «G» градиентом, как на утверждённом кадре. */}
        <h1 className="hero-title text-[clamp(2.6rem,9vw,7rem)] leading-[0.95] font-light tracking-[-0.015em] text-mist uppercase">
          <span className="hero-mark">{title.slice(0, 1)}</span>
          {title.slice(1)}
        </h1>

        <p className="mt-7 max-w-2xl text-[length:var(--text-lead)] leading-relaxed text-frost text-pretty">
          {subtitle}
        </p>

        {/* Светящаяся черта из макета: граница между рассказом о компании и
            действием, которое ей предлагают. */}
        <span
          aria-hidden="true"
          className="mt-9 block h-px w-[min(26rem,70%)] bg-[linear-gradient(to_right,transparent,var(--electric),transparent)]"
        />

        <div className="mt-9">{action}</div>

        <ul className="mt-14 flex flex-wrap items-center justify-center gap-y-4">
          {highlights.map((item, index) => (
            <li
              key={item.label}
              className={cn(
                'flex items-center gap-2.5 px-4 sm:px-6',
                // Разделители только между соседями в строке: у первого в ряду
                // черта слева повисает в воздухе.
                index > 0 && 'sm:border-l sm:border-mist/15',
              )}
            >
              <Icon name={item.icon} className="size-4 shrink-0 text-electric sm:size-5" />
              <span className="text-xs leading-tight text-mist sm:text-sm">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
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

  return (
    <div className="relative">
      {/* Пятна ходят навстречу друг другу: встречное движение даёт глубину,
          которой одинаковый сдвиг обоих слоёв не даёт. */}
      <Bloom className="top-[-18%] right-[-6%]" size={720} opacity={0.2} alive />
      <Bloom className="bottom-[-24%] left-[-12%]" size={540} opacity={0.1} alive drift="counter" />

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
        {/*
          Лента, а не подмена содержимого.
          Раньше слайд пересоздавался по `key={index}`: новый приходил снизу,
          а старый исчезал мгновенно — смена читалась скачком, и свайп пальцем
          ни с чем не был связан. Теперь слайды стоят в ряд и ряд едет, так что
          движение совпадает с жестом.
        */}
        <Reveal className="overflow-hidden">
          <div
            className="flex transition-transform duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
            style={{ transform: `translate3d(${-index * 100}%, 0, 0)` }}
          >
            {slides.map((item, i) => (
              <div
                key={item.title}
                /*
                 * Уехавший слайд выводится из обхода целиком. Без этого кнопка
                 * «Попробовать» за краем экрана остаётся доступной с
                 * клавиатуры, и фокус уходит в невидимое — `aria-hidden` прячет
                 * узел от читалки, но не от табуляции, а `inert` делает и то и
                 * другое.
                 */
                inert={i !== index ? true : undefined}
                className="grid w-full shrink-0 items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16"
              >
                {/*
                  Внутри ленты появления нет намеренно. Соседние слайды стоят
                  за краем окна, наблюдатель их не видит — и, доехав, они
                  показывались бы прозрачными, пока он не сработает. Вход
                  играет сама лента, а мягкое появление всего блока даёт один
                  Reveal снаружи.
                */}
                <div>
                  <p className="eyebrow">
                    {String(i + 1).padStart(2, '0')} · {item.eyebrow}
                  </p>

                  <h2 className="display mt-7 max-w-3xl">{item.title}</h2>

                  <p className="mt-7 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-fg-muted text-pretty">
                    {item.text}
                  </p>

                  <div className="mt-10">
                    {item.href ? (
                      <LinkButton href={appLink(item.href)} size="lg" arrow>
                        {item.cta}
                      </LinkButton>
                    ) : (
                      <Button onClick={openLead} size="lg" arrow>
                        {item.cta}
                      </Button>
                    )}
                  </div>
                </div>

                <SlideVisual slide={item} />
              </div>
            ))}
          </div>
        </Reveal>

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
