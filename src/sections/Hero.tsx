import { useStore } from '@/lib/store'
import { Bloom, GridLines } from '@/ui/decor'
import { GlassOrb, GlassSlab, TrajectoryLines } from '@/ui/iridescent'
import { Button, Eyebrow, LinkButton, Reveal } from '@/ui/primitives'

/**
 * Первый экран.
 *
 * Композиция строится на крупной лёгкой типографике и одном стеклянном объекте,
 * который частично заходит на заголовок — приём даёт глубину без фотографий и
 * тяжёлой графики. Под текстом лежит подложка, поэтому контраст не зависит от
 * того, где именно оказался объект.
 */
export function Hero() {
  const { content, appLink, openLead } = useStore()
  const hero = content.hero

  return (
    <section id="top" className="relative overflow-hidden">
      <GridLines />
      <TrajectoryLines className="opacity-70" />
      <Bloom className="top-[-10%] right-[-5%]" size={640} opacity={0.16} />
      <Bloom className="bottom-[-20%] left-[-10%]" size={520} color="var(--irid-1)" opacity={0.1} />

      {/* Стеклянные объекты: главный заходит на заголовок, второй уравновешивает низ. */}
      <GlassSlab className="top-[8%] right-[6%] hidden lg:block" size={340} seed={0} parallax={16} />
      <GlassOrb className="right-[26%] bottom-[14%] hidden xl:block" size={130} seed={140} parallax={26} />
      {/* На узком экране объект уходит под текст, к нижней кромке: наезжать на
          заголовок и кнопки он не должен. */}
      <GlassSlab
        className="-right-14 -bottom-10 block lg:hidden"
        size={190}
        seed={40}
        parallax={10}
      />

      <div className="scrim pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="relative mx-auto flex min-h-[max(640px,92svh)] max-w-7xl flex-col justify-center px-5 pt-20 pb-32 sm:px-8 lg:pb-20">
        <Reveal>
          <Eyebrow>{hero.eyebrow}</Eyebrow>
        </Reveal>

        <Reveal delayMs={90}>
          <h1 className="display mt-8 max-w-4xl">
            {hero.titleLines.map((line, i) => (
              <span key={line} className="block">
                {/* Последняя строка — акцентная: тонкая цветная деталь на весь экран. */}
                {i === hero.titleLines.length - 1 ? (
                  <span className="text-accent">{line}</span>
                ) : (
                  line
                )}
              </span>
            ))}
          </h1>
        </Reveal>

        <Reveal delayMs={180}>
          <p className="mt-8 max-w-xl text-[length:var(--text-lead)] leading-relaxed text-fg-muted text-pretty">
            {hero.subtitle}
          </p>
        </Reveal>

        <Reveal delayMs={260}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button onClick={openLead} size="lg" arrow>
              {hero.primaryCta}
            </Button>
            <LinkButton href="#services" variant="outline" size="lg">
              {hero.secondaryCta}
            </LinkButton>
          </div>
        </Reveal>

        <Reveal delayMs={340}>
          <p className="mt-8 max-w-md text-xs text-fg-subtle">{hero.note}</p>
        </Reveal>

        <Reveal delayMs={420} className="mt-16 hidden sm:block">
          <a
            href={appLink('/register')}
            className="hairline surface inline-flex items-center gap-3 rounded-pill py-2 pr-5 pl-2 text-xs text-fg-muted transition hover:text-fg"
          >
            <span className="rounded-pill bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
              Свой продукт
            </span>
            Gravity RPA — CRM с автоматизацией. Попробовать бесплатно
          </a>
        </Reveal>
      </div>
    </section>
  )
}
