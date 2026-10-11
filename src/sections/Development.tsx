import { useStore } from '@/lib/store'
import { Button, Card, LinkButton, Reveal, Section } from '@/ui/primitives'

/**
 * Индивидуальная разработка.
 *
 * Раздел назывался «IT-решения для вашего бизнеса», а соседний — «Наши
 * продукты», и отличить их было нельзя: оба про IT и оба про бизнес. Теперь
 * названия говорят, чем они отличаются на самом деле: здесь делают под задачу,
 * там берут готовое.
 *
 * Внизу развилка между этими двумя путями. Она переехала сюда с первого
 * экрана: там две кнопки стояли рядом с кнопкой продукта и перетягивали
 * внимание, а объяснить разницу между направлениями на первом экране нечем.
 * Здесь человек уже прочитал, что такое разработка, и выбирает осознанно.
 */
export function Development() {
  const { content, openLead } = useStore()
  const d = content.development

  return (
    <Section id="development">
      <Reveal className="max-w-3xl">
        <p className="eyebrow">{d.eyebrow}</p>
        <h2 className="mt-6 text-[length:var(--text-h2)] leading-[1.05] font-light tracking-tight text-balance uppercase">
          {d.title}
        </h2>
        {d.subtitle && <p className="mt-5 max-w-xl text-fg-muted text-pretty">{d.subtitle}</p>}
      </Reveal>

      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {d.items.map((item, i) => (
          <Reveal key={item.title} delayMs={(i % 3) * 70}>
            <Card hoverable className="flex h-full flex-col p-7">
              <div className="flex items-start justify-between gap-4">
                <span className="mono-label">{String(i + 1).padStart(2, '0')}</span>
                {/* Геометрическая метка вместо иконки: шести направлениям
                    разработки честных пиктограмм не подобрать, а приблизительные
                    заставляют читать карточку дважды — сначала картинку, потом
                    заголовок. Круг и квадрат чередуются и просто размечают ритм. */}
                <span
                  aria-hidden="true"
                  className={`size-9 shrink-0 border border-accent/50 ${i % 2 === 0 ? 'rounded-full' : 'rounded-lg'}`}
                />
              </div>
              <h3 className="mt-10 text-lg font-medium">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-fg-muted text-pretty">{item.text}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal delayMs={120}>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button onClick={openLead} size="lg" className="w-full" arrow>
            {d.primaryCta}
          </Button>
          <LinkButton href="#products" variant="outline" size="lg" className="w-full">
            {d.secondaryCta}
          </LinkButton>
        </div>
      </Reveal>
    </Section>
  )
}
