import { useStore } from '@/lib/store'
import { Card, Reveal, Section, SectionHeading } from '@/ui/primitives'

/**
 * Возможности кабинета.
 *
 * Шесть карточек — по одной на участок работы, от подключения агентства до
 * аналитики. Порядок повторяет путь сделки, а не важность: так человек читает
 * их как маршрут, а не как перечень галочек.
 *
 * Иконок нет намеренно. Шести участкам работы («фиксации и споры», «комиссии и
 * выплаты») честные пиктограммы не подбираются, а приблизительные заставляют
 * читать подпись дважды — сначала картинку, потом заголовок.
 */
export function Features() {
  const { content } = useStore()
  const f = content.features

  return (
    <Section id="features">
      <SectionHeading eyebrow={f.eyebrow} title={f.title} />

      <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {f.items.map((item, i) => (
          <Reveal key={item.title} delayMs={(i % 3) * 70}>
            <Card className="h-full p-6" hoverable>
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted text-pretty">{item.text}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      {f.integrations && (
        <Reveal delayMs={120}>
          <p className="mt-4 rounded-2xl border border-line px-5 py-4 text-sm text-fg-muted text-pretty">
            {f.integrations}
          </p>
        </Reveal>
      )}
    </Section>
  )
}
