import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'
import { Icon } from '@/ui/Icon'
import { Button, Card, LinkButton, Reveal, Section, SectionHeading } from '@/ui/primitives'

/**
 * Тарифы платформы. Цены не публикуются: стоимость считается под состав команды
 * и набор модулей, поэтому вместо цифры — понятный следующий шаг. Бесплатный
 * тариф ведёт сразу в регистрацию, платные — в форму заявки.
 */
export function Plans() {
  const { content, appLink, openLead } = useStore()
  const { eyebrow, title, subtitle, note, items } = content.plans

  return (
    <Section id="plans">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((plan, i) => (
          <Reveal key={plan.name} delayMs={i * 60}>
            <Card className={cn('flex h-full flex-col p-6', plan.highlighted && 'border-accent/45')}>
              {plan.highlighted && (
                <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-pill bg-accent-soft px-2.5 py-1 text-[11px] font-medium text-accent">
                  <Icon name="Sparkles" className="size-3" />
                  Популярный
                </span>
              )}
              <h3 className="text-base font-medium tracking-tight">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-fg-muted">{plan.description}</p>
              <p className="mt-5 text-xl font-light tracking-tight">{plan.price}</p>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-sm text-fg-muted">
                    <Icon name="Check" className="mt-0.5 size-3.5 shrink-0 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>

              {plan.price === 'Бесплатно' ? (
                <LinkButton
                  href={appLink('/register')}
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="mt-7 w-full"
                >
                  {plan.cta}
                </LinkButton>
              ) : (
                <Button
                  onClick={openLead}
                  variant={plan.highlighted ? 'primary' : 'outline'}
                  className="mt-7 w-full"
                >
                  {plan.cta}
                </Button>
              )}
            </Card>
          </Reveal>
        ))}
      </div>

      {note && <p className="mt-6 text-xs text-fg-subtle">{note}</p>}
    </Section>
  )
}
