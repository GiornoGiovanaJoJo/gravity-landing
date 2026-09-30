import { useStore } from '@/lib/store'
import { Eyebrow, LinkButton, Reveal } from '@/ui/primitives'
import { DemoForm } from './DemoForm'

/**
 * Первый экран.
 *
 * Слева — что это и кнопка попробовать, справа — как выглядит кабинет. Макет
 * интерфейса здесь не украшение: продукт продаётся тем, что его видно, и
 * человек с первого экрана понимает, о каком инструменте речь.
 *
 * Фон ровный, без сетки и подсветок: справа стоит снимок интерфейса, и любой
 * декор за ним начинает читаться как часть этого интерфейса.
 */
export function Hero() {
  const { content } = useStore()
  const hero = content.hero

  return (
    <section id="top" className="relative">
      <div className="relative mx-auto grid max-w-7xl items-start gap-12 px-5 pt-14 pb-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pt-20 lg:pb-14">
        <div>
          <Reveal>
            <Eyebrow>{hero.eyebrow}</Eyebrow>
          </Reveal>

          <Reveal delayMs={90}>
            <h1 className="display mt-5">
              {hero.titleLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </Reveal>

          <Reveal delayMs={180}>
            <p className="mt-6 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-fg-muted text-pretty">
              {hero.subtitle}
            </p>
          </Reveal>

          <Reveal delayMs={260}>
            <DemoForm className="mt-8 max-w-xl" submitLabel={hero.primaryCta} note={hero.note} />
          </Reveal>

          <Reveal delayMs={340}>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <LinkButton href="#lead" variant="outline">
                {hero.deckCta}
              </LinkButton>
              {/* Ссылки на файл может не быть, пока презентацию не загрузили —
                  мёртвая кнопка «Скачать» хуже её отсутствия. */}
              {hero.deckUrl && (
                <a
                  href={hero.deckUrl}
                  className="text-sm text-fg-muted underline underline-offset-4 transition hover:text-fg"
                >
                  {hero.deckLink}
                </a>
              )}
            </div>
          </Reveal>
        </div>

        <Reveal delayMs={200}>
          <HeroMock />
        </Reveal>
      </div>
    </section>
  )
}

/**
 * Макет кабинета: боковое меню и этапы воронки полосами.
 *
 * Полосы сужаются книзу — это воронка, читаемая без единой цифры. Цифры здесь
 * сознательно не показываются, а под макетом стоит оговорка: выдать
 * демонстрационные данные за результат клиента значит потерять доверие ко всей
 * странице на первом же вопросе «у кого такие цифры».
 */
function HeroMock() {
  const { content } = useStore()
  const hero = content.hero

  // Первый этап — акцентом, дальше синий и сиреневый: видно, что этапы разные,
  // но принадлежат одной воронке.
  const tones = [
    'bg-chart-1 text-accent-contrast',
    'bg-chart-2 text-white',
    'bg-chart-3 text-white',
    'bg-chart-4 text-white',
  ]

  return (
    <div className="hairline surface rounded-2xl p-5 sm:p-6">
      <p className="caption-label">{content.screens.frameLabel}</p>

      <div className="mt-6 grid gap-6 sm:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)]">
        <ul className="space-y-3 text-sm">
          {hero.mockNav.map((item, i) => (
            <li key={item} className={i === 0 ? 'font-semibold text-fg' : 'text-fg-muted'}>
              {item}
            </li>
          ))}
        </ul>

        <div>
          <p className="text-xs text-fg-subtle">Этапы воронки</p>
          <div className="mt-3 space-y-2.5">
            {hero.mockStages.map((stage, i) => (
              <div
                key={stage.label}
                className={`flex h-9 items-center rounded-lg px-3 text-sm font-medium ${tones[i % tones.length]}`}
                style={{ width: `${stage.width}%` }}
              >
                {stage.label}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-line px-3 py-2.5 text-sm">
            <span className="text-fg-muted">Комиссии к выплате</span>
            <span className="font-medium">Акт</span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-fg-subtle">{hero.mockNote}</p>
    </div>
  )
}
