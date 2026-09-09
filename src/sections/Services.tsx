import { useStore } from '@/lib/store'
import { Icon } from '@/ui/Icon'
import { GlassOrb } from '@/ui/iridescent'
import { Button, Card, Reveal, Section, SectionHeading } from '@/ui/primitives'

/**
 * Услуги — главный смысловой блок сайта: за ними приходят чаще всего.
 *
 * Сетка неровная: первая карточка широкая, остальные обычные. Такой ритм
 * задаёт иерархию без дополнительных заголовков и повторяет приём референса.
 */
export function Services() {
  const { content, openLead } = useStore()
  const { eyebrow, title, subtitle, items } = content.services

  return (
    <Section id="services">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <Reveal delayMs={120}>
          <Button onClick={openLead} variant="outline" arrow>
            Обсудить задачу
          </Button>
        </Reveal>
      </div>

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal
            key={item.title}
            delayMs={i * 60}
            className={item.wide ? 'sm:col-span-2' : undefined}
          >
            <Card hoverable className="relative h-full overflow-hidden p-6 sm:p-8">
              {/* В широкой карточке стекло работает акцентом всей секции. */}
              {item.wide && <GlassOrb className="top-6 right-6 hidden sm:block" size={116} seed={220} parallax={12} />}

              <span className="hairline flex size-10 items-center justify-center rounded-full text-accent">
                <Icon name={item.icon} className="size-4.5" />
              </span>

              <h3 className="relative mt-8 text-lg font-medium tracking-tight">{item.title}</h3>
              <p className="relative mt-3 max-w-md text-sm leading-relaxed text-fg-muted text-pretty">
                {item.text}
              </p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
