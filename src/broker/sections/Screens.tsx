import { useRef, useState } from 'react'
import { useBrokerStore } from '../store'
import { cn } from '@/lib/cn'
import type { ThemeMode } from '@/lib/hooks'
import { Icon } from '@/ui/Icon'
import { track } from '../tracking'
import { Reveal, Section, SectionHeading } from '../ui'

/**
 * Экраны кабинета.
 *
 * Рамка карусели следует теме страницы, а не сделана акцентной панелью: внутри
 * лежит снимок кабинета в той же теме, и тёмная подложка под светлым снимком
 * (или наоборот) выдавала бы его за чужую картинку.
 *
 * Карусель, а не сетка: экранов шесть, и в сетке каждый становится марочкой,
 * на которой ничего не разобрать. Здесь один большой, а по краям — силуэты
 * соседних: видно, что дальше есть ещё, и при этом они не отвлекают.
 *
 * Листается кнопками, точками и стрелками на клавиатуре. Автопрокрутки нет
 * намеренно: человек рассматривает снимок интерфейса в своём темпе, а
 * уезжающий из-под взгляда экран раздражает.
 */
export function Screens({ theme }: { theme: ThemeMode }) {
  const { content } = useBrokerStore()
  const s = content.screens
  const [index, setIndex] = useState(0)
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const touchX = useRef<number | null>(null)

  if (s.items.length === 0) return null

  const total = s.items.length
  const current = s.items[index]
  // Снимок берётся под тему страницы: кабинет умеет обе, и светлый интерфейс
  // на тёмной странице читается как вклеенная чужая картинка.
  const shot = (theme === 'dark' && current.imageUrlDark) || current.imageUrl
  const go = (next: number) => {
    setIndex((next + total) % total)
    track('screens_slide')
  }

  return (
    <Section id="screens">
      <SectionHeading eyebrow={s.eyebrow} title={s.title} />

      <Reveal className="mt-10">
        <div
          className="relative rounded-3xl border border-line bg-bg-soft px-4 py-8 sm:px-8 sm:py-10"
          role="group"
          aria-roledescription="карусель"
          aria-label={s.title}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') go(index - 1)
            if (e.key === 'ArrowRight') go(index + 1)
          }}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null
          }}
          onTouchEnd={(e) => {
            // Свайп на мобильном: кнопки со стрелками там не показываются, и
            // без него листать можно только точками — по ним трудно попасть.
            const start = touchX.current
            touchX.current = null
            if (start === null) return
            const delta = (e.changedTouches[0]?.clientX ?? start) - start
            if (Math.abs(delta) < 48) return
            go(delta < 0 ? index + 1 : index - 1)
          }}
        >
          <figure>
            <div className="relative flex items-stretch justify-center gap-4">
              <Ghost />

              <div className="min-w-0 flex-1 rounded-2xl border border-accent/40 p-4 sm:p-5 lg:max-w-3xl">
                <p className="b-caption">{s.frameLabel}</p>
                <div className="mt-4 overflow-hidden rounded-xl">
                  {shot && !failed.has(shot) ? (
                    <img
                      key={shot}
                      src={shot}
                      alt={current.title}
                      loading="lazy"
                      decoding="async"
                      width={1600}
                      height={1000}
                      onError={() => setFailed((prev) => new Set(prev).add(shot))}
                      className="block w-full rounded-xl border border-line"
                    />
                  ) : (
                    // Снимка нет или он не загрузился — честная рамка с
                    // подписью. Битая картинка вместо неё схлопывает карточку и
                    // утаскивает за собой всю раскладку карусели.
                    <div className="flex aspect-[16/10] items-center justify-center rounded-xl border border-dashed border-line px-6 text-center text-sm text-fg-subtle">
                      [Скриншот: {current.title.toLowerCase()}]
                    </div>
                  )}
                </div>
              </div>

              <Ghost />

              {/* Кнопки лежат поверх силуэтов: в макете они стоят на самом краю
                  полосы, а не отнимают ширину у активного экрана. */}
              <CarouselButton className="left-0" label="Предыдущий экран" onClick={() => go(index - 1)}>
                <Icon name="ChevronLeft" className="size-4" />
              </CarouselButton>
              <CarouselButton className="right-0" label="Следующий экран" onClick={() => go(index + 1)}>
                <Icon name="ChevronRight" className="size-4" />
              </CarouselButton>
            </div>

            <figcaption className="mt-7 text-center">
              <h3 className="text-base font-semibold">{current.title}</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-fg-muted text-pretty">{current.text}</p>
            </figcaption>
          </figure>

          <div className="mt-6 flex items-center justify-center gap-2">
            {s.items.map((item, i) => (
              <button
                key={item.title}
                type="button"
                aria-label={item.title}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 rounded-pill transition-all',
                  i === index ? 'w-7 bg-accent' : 'w-2 bg-line-strong hover:bg-accent/60',
                )}
              />
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  )
}

/** Силуэт соседнего экрана. Виден только там, где для него есть место. */
function Ghost() {
  return (
    <div
      aria-hidden="true"
      className="my-12 hidden w-[13%] shrink-0 rounded-2xl border border-line bg-bg-elevated/70 lg:block"
    />
  )
}

function CarouselButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg text-fg-muted transition hover:border-accent hover:text-fg sm:flex',
        className,
      )}
    >
      {children}
    </button>
  )
}
