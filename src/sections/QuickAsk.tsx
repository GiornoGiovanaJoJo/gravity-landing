import { useState } from 'react'
import { submitLead, type LeadResult } from '@/lib/api'
import { isContactUsable, splitContact } from '@/lib/contact'
import { useStore } from '@/lib/store'
import { Icon } from '@/ui/Icon'
import { Button, Field, Reveal, Section } from '@/ui/primitives'

/**
 * Быстрый вопрос.
 *
 * Короткая форма посреди страницы: до разговора о проекте человек доходит не
 * всегда, а спросить хочет сейчас. Три поля и одно из них необязательное —
 * настоящая форма заявки ждёт внизу, и дублировать её здесь значит спросить
 * одно и то же дважды.
 *
 * Контакт одним полем: телефон или почта — что удобнее. По CRM они всё равно
 * разъезжаются в разные поля, но это наша забота, а не посетителя.
 */
export function QuickAsk() {
  const { content } = useStore()
  const q = content.quick
  const contacts = content.contacts

  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | LeadResult>('idle')

  const sending = state === 'sending'
  const ready = name.trim().length > 1 && isContactUsable(contact)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sending || !ready) return
    setState('sending')
    const { phone, email } = splitContact(contact)
    setState(
      await submitLead(content.brand.formSlug, {
        name: name.trim(),
        phone,
        email,
        comment: message.trim() || 'Быстрый вопрос с сайта',
      }),
    )
  }

  const channels = q.channels.filter((c) => c.href)

  return (
    <Section id="quick" className="border-t border-line">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow">{q.eyebrow}</p>
          <h2 className="mt-6 text-[length:var(--text-h3,1.75rem)] text-2xl leading-snug font-light text-balance sm:text-3xl">
            {q.title}
          </h2>
          {q.text && <p className="mt-5 max-w-md text-sm text-fg-muted text-pretty">{q.text}</p>}

          {channels.length > 0 && (
            <ul className="mt-9 flex flex-wrap gap-2.5">
              {channels.map((channel) => (
                <li key={channel.href}>
                  <a
                    href={channel.href}
                    target="_blank"
                    rel="noreferrer"
                    className="hairline inline-flex items-center rounded-pill px-5 py-2.5 text-sm text-fg-muted transition hover:border-line-strong hover:text-fg"
                  >
                    {channel.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Reveal>

        <Reveal delayMs={80}>
          {state === 'ok' ? (
            <div className="hairline flex items-start gap-3 rounded-card p-6">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <Icon name="Check" className="size-4" />
              </span>
              <div>
                <p className="font-medium">{content.lead.successTitle}</p>
                <p className="mt-1 text-sm text-fg-muted text-pretty">{content.lead.successText}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3">
              <Field label="Имя" name="quick-name" value={name} onChange={setName} placeholder="Как к вам обращаться" required autoComplete="name" />
              <Field
                label="Телефон или email"
                name="quick-contact"
                value={contact}
                onChange={setContact}
                placeholder="+7 900 000-00-00 или name@company.ru"
                required
              />
              <Field
                label="Сообщение"
                name="quick-message"
                value={message}
                onChange={setMessage}
                placeholder="Необязательно"
                multiline
              />

              {(state === 'error' || state === 'not-configured') && (
                <p className="rounded-xl bg-amber-500/12 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
                  {content.lead.fallbackText}
                  {(contacts.phone || contacts.email) && (
                    <span className="mt-1 block text-fg-muted">
                      {contacts.phone} {contacts.phone && contacts.email ? '·' : ''} {contacts.email}
                    </span>
                  )}
                </p>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={sending || !ready}>
                {sending ? 'Отправляем…' : q.submitLabel}
              </Button>
            </form>
          )}
        </Reveal>
      </div>
    </Section>
  )
}
