import { useBrokerStore } from '../store'
import { Icon } from '@/ui/Icon'
import { Eyebrow, Reveal, Section } from '../ui'
import { DemoForm } from './DemoForm'

/**
 * Финальный призыв.
 *
 * Та же форма из одного поля, что и наверху, — третье и последнее место, где
 * её встречает человек. Анкеты здесь нет намеренно: имя, компанию и телефон
 * спрашивают уже внутри демо, когда продукт увидели и есть о чём говорить.
 */
export function Lead() {
  const { content } = useBrokerStore()
  const lead = content.lead
  const contacts = content.contacts

  return (
    <Section id="lead">
      <div className="b-panel b-glow rounded-3xl px-6 py-12 sm:px-12 sm:py-16">
        <Reveal className="mx-auto max-w-2xl text-center">
          <Eyebrow>{lead.eyebrow}</Eyebrow>
          <h2 className="b-headline mt-3 text-balance">{lead.title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-fg-muted text-pretty">{lead.text}</p>

          <DemoForm
            className="mx-auto mt-8 max-w-xl text-left"
            submitLabel={lead.submitLabel}
            note={lead.note}
            source="Демо-доступ с сайта (финальный блок)"
          />

          {(contacts.phone || contacts.email || contacts.telegram) && (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {contacts.phone && (
                <ContactRow icon="Phone" label={contacts.phone} href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`} />
              )}
              {contacts.email && <ContactRow icon="Mail" label={contacts.email} href={`mailto:${contacts.email}`} />}
              {contacts.telegram && <ContactRow icon="Send" label="Telegram" href={contacts.telegram} />}
            </div>
          )}
        </Reveal>
      </div>
    </Section>
  )
}

function ContactRow({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-2 text-sm text-fg-muted transition hover:text-fg">
      <Icon name={icon} className="size-4 text-accent" />
      {label}
    </a>
  )
}
