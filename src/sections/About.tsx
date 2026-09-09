import { useCountUp, useInView, usePrefersReducedMotion } from '@/lib/hooks'
import { useStore } from '@/lib/store'
import { GlassSlab } from '@/ui/iridescent'
import { Eyebrow, Reveal, Section } from '@/ui/primitives'

function Metric({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>(!reduced)
  const shown = useCountUp(value, inView && !reduced)

  return (
    <div ref={ref}>
      <div className="text-4xl font-light tracking-tight sm:text-5xl">
        {reduced ? value : shown}
        <span className="text-accent">{suffix}</span>
      </div>
      <p className="mt-2 text-sm text-fg-muted">{label}</p>
    </div>
  )
}

/**
 * О студии. Здесь же — единственное на весь сайт упоминание основателя:
 * посетитель должен понимать, к кому обращается, но сайт остаётся про работу.
 */
export function About() {
  const { content } = useStore()
  const about = content.about

  return (
    <Section id="about" className="border-y border-line">
      <GlassSlab className="top-1/2 right-[4%] hidden -translate-y-1/2 lg:block" size={220} seed={90} parallax={18} />

      <div className="relative grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>{about.eyebrow}</Eyebrow>
            <h2 className="mt-5 max-w-2xl text-[length:var(--text-h2)] leading-[1.05] font-light tracking-tight text-balance uppercase">
              {about.title}
            </h2>
          </Reveal>
          <Reveal delayMs={100}>
            <p className="mt-6 max-w-xl leading-relaxed text-fg-muted text-pretty">{about.text}</p>
          </Reveal>
          <Reveal delayMs={160}>
            <p className="mt-8 flex items-center gap-3 text-sm text-fg-subtle">
              <span className="h-px w-8 bg-line-strong" aria-hidden="true" />
              {about.signature}
            </p>
          </Reveal>
        </div>

        <Reveal delayMs={120} className="grid gap-10 self-center sm:grid-cols-3 lg:grid-cols-1 lg:gap-12">
          {about.metrics.map((metric) => (
            <Metric key={metric.label} {...metric} />
          ))}
        </Reveal>
      </div>
    </Section>
  )
}
