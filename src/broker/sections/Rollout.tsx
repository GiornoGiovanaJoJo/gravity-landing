import { useBrokerStore } from '../store'
import { Card, Reveal, Section, SectionHeading } from '../ui'

/**
 * Внедрение.
 *
 * Четыре шага отвечают на вопрос, который задают перед покупкой коробки: «что
 * именно произойдёт после того, как мы согласимся». Без этого продукт выглядит
 * как ещё одна система, которую придётся внедрять самим.
 *
 * Юридические отметки внизу — заявления, а не украшение: каждое из них можно
 * проверить, поэтому список приходит из контента и заполняется только тем, что
 * подтверждено.
 */
export function Rollout() {
  const { content } = useBrokerStore()
  const r = content.rollout

  return (
    <Section id="rollout">
      <SectionHeading eyebrow={r.eyebrow} title={r.title} />

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {r.steps.map((step, i) => (
          <Reveal key={step.title} delayMs={i * 60}>
            <Card tint className="h-full p-6">
              <span className="text-base font-semibold text-accent tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted text-pretty">{step.text}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      {r.note && (
        <Reveal delayMs={120}>
          <p className="mt-4 rounded-xl border border-dashed border-line px-5 py-4 text-sm text-fg-muted text-pretty">
            {r.note}
          </p>
        </Reveal>
      )}

      {r.badges.length > 0 && (
        <Reveal delayMs={180}>
          <ul className="mt-12 flex flex-wrap gap-3">
            {r.badges.map((badge) => (
              <li
                key={badge}
                className="rounded-lg border border-dashed border-line px-4 py-2.5 text-sm text-fg-muted"
              >
                {badge}
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </Section>
  )
}
