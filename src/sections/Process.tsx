import { useStore } from '@/lib/store'
import { Reveal, Section, SectionHeading } from '@/ui/primitives'

/**
 * Этапы работы. Список, а не карточки: последовательность важнее декора, а
 * нумерация и линия слева читаются как траектория проекта.
 */
export function Process() {
  const { content } = useStore()
  const { eyebrow, title, subtitle, steps } = content.process

  return (
    <Section id="process">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <ol className="mt-14 border-t border-line">
        {/* Reveal внутри <li>, а не снаружи: между <ol> и <li> не должно быть
            посторонних элементов, иначе список перестаёт быть списком. */}
        {steps.map((step, i) => (
          <li key={step.title} className="group border-b border-line">
            <Reveal
              delayMs={i * 70}
              className="grid gap-4 py-8 sm:grid-cols-[auto_1fr_auto] sm:items-baseline sm:gap-10"
            >
              <span className="font-mono text-xs text-fg-subtle tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className="text-xl font-light tracking-tight transition-colors group-hover:text-accent sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-fg-muted text-pretty">{step.text}</p>
              </div>
              <span className="text-xs whitespace-nowrap text-fg-subtle">{step.duration}</span>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  )
}
