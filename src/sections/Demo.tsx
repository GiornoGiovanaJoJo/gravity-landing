import { useStore } from '@/lib/store'
import { Eyebrow, Reveal, Section } from '@/ui/primitives'
import { DemoForm } from './DemoForm'

/**
 * Демо-доступ.
 *
 * Отдельный блок в рамке, а не строка в подвале: попробовать самому — главное
 * действие страницы, и оно должно встретиться человеку второй раз, когда он уже
 * прочитал, что умеет кабинет.
 *
 * Три шага сняты с вопроса «что от меня потребуется»: пока он не отвечен,
 * кнопку не нажимают из опасения попасть на звонок менеджера.
 */
export function Demo() {
  const { content } = useStore()
  const demo = content.demo

  return (
    <Section id="demo">
      <Reveal>
        <div className="rounded-2xl border border-accent/45 p-7 sm:p-10">
          <Eyebrow>{demo.eyebrow}</Eyebrow>
          <h2 className="headline mt-4 max-w-2xl text-balance">{demo.title}</h2>

          <ol className="mt-9 grid gap-4 md:grid-cols-3">
            {demo.steps.map((step, i) => (
              <li key={step.title} className="rounded-xl border border-line p-5">
                <span className="text-sm font-semibold text-accent tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-base font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted text-pretty">{step.text}</p>
              </li>
            ))}
          </ol>

          <DemoForm
            className="mt-8 max-w-xl"
            submitLabel={demo.submitLabel}
            source="Демо-доступ с сайта (блок «Попробуйте кабинет»)"
          />
        </div>
      </Reveal>
    </Section>
  )
}
