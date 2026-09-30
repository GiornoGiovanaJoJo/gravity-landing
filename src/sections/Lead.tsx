import { useState } from 'react'
import { submitLead, type LeadResult } from '@/lib/api'
import { useStore } from '@/lib/store'
import { Icon } from '@/ui/Icon'
import { Button, Card, Eyebrow, Field, Modal, Reveal, Section } from '@/ui/primitives'

/**
 * Приводит ввод к виду +7 (999) 999-99-99.
 *
 * Своя функция вместо библиотеки масок: правило одно, а лишняя зависимость на
 * сайте стоит дороже двадцати строк.
 */
function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  if (digits[0] === '8') digits = `7${digits.slice(1)}`
  if (digits[0] !== '7') digits = `7${digits}`
  digits = digits.slice(0, 11)

  const rest = digits.slice(1)
  let out = '+7'
  if (rest.length) out += ` (${rest.slice(0, 3)}`
  if (rest.length >= 3) out += `) ${rest.slice(3, 6)}`
  if (rest.length >= 6) out += `-${rest.slice(6, 8)}`
  if (rest.length >= 8) out += `-${rest.slice(8, 10)}`
  return out
}

function isPhoneComplete(masked: string) {
  return masked.replace(/\D/g, '').length === 11
}

function LeadForm({ compact = false }: { compact?: boolean }) {
  const { content } = useStore()
  const lead = content.lead
  const contacts = content.contacts

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [comment, setComment] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | LeadResult>('idle')

  const sending = state === 'sending'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setState('sending')
    setState(await submitLead(content.brand.formSlug, { name, phone, email, comment }))
  }

  if (state === 'ok') {
    return (
      <div className="py-8 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <Icon name="Check" className="size-6" />
        </span>
        <h3 className="mt-5 text-lg">{lead.successTitle}</h3>
        <p className="mt-2 text-sm text-fg-muted text-pretty">{lead.successText}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className={compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
        <Field label="Имя" name="name" value={name} onChange={setName} placeholder="Как к вам обращаться" required autoComplete="name" />
        <Field
          label="Телефон"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(v) => setPhone(formatPhone(v))}
          placeholder="+7 (___) ___-__-__"
          required
        />
      </div>
      <Field
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={setEmail}
        placeholder="name@company.ru"
      />
      <Field
        label="Задача"
        name="comment"
        value={comment}
        onChange={setComment}
        placeholder="Что нужно сделать и к какому сроку"
        multiline
      />

      {(state === 'error' || state === 'not-configured') && (
        <p className="rounded-xl bg-amber-500/12 px-4 py-3 text-xs text-amber-700 dark:text-amber-300">
          {state === 'not-configured'
            ? lead.fallbackText
            : 'Не удалось отправить заявку. Попробуйте ещё раз или напишите нам напрямую.'}
          {(contacts.phone || contacts.email) && (
            <span className="mt-1 block text-fg-muted">
              {contacts.phone} {contacts.phone && contacts.email ? '·' : ''} {contacts.email}
            </span>
          )}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={sending || !name || !isPhoneComplete(phone)}>
        {sending ? 'Отправляем…' : lead.submitLabel}
      </Button>

      <p className="text-center text-[11px] leading-relaxed text-fg-subtle">{lead.consent}</p>
    </form>
  )
}

export function Lead() {
  const { content } = useStore()
  const lead = content.lead
  const contacts = content.contacts

  return (
    <Section id="lead" className="border-t border-line">
      <div className="relative grid items-start gap-10 lg:grid-cols-2 lg:gap-20">
        <div>
          <Reveal>
            <Eyebrow>{lead.eyebrow}</Eyebrow>
            <h2 className="headline mt-3 text-balance">{lead.title}</h2>
            <p className="mt-5 max-w-md text-fg-muted text-pretty">{lead.text}</p>
          </Reveal>

          {(contacts.phone || contacts.email || contacts.telegram || contacts.whatsapp) && (
            <Reveal delayMs={100} className="mt-10 space-y-3">
              {contacts.phone && (
                <ContactRow icon="Phone" label={contacts.phone} href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`} />
              )}
              {contacts.email && <ContactRow icon="Mail" label={contacts.email} href={`mailto:${contacts.email}`} />}
              {contacts.telegram && <ContactRow icon="Send" label={contacts.telegram} href={contacts.telegram} />}
              {contacts.whatsapp && <ContactRow icon="MessageCircle" label={contacts.whatsapp} href={contacts.whatsapp} />}
            </Reveal>
          )}
        </div>

        <Reveal delayMs={80}>
          <Card className="p-6 sm:p-8">
            <LeadForm />
          </Card>
        </Reveal>
      </div>
    </Section>
  )
}

function ContactRow({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 text-sm text-fg-muted transition hover:text-fg">
      <span className="hairline flex size-9 items-center justify-center rounded-full text-accent">
        <Icon name={icon} className="size-4" />
      </span>
      {label}
    </a>
  )
}

/** Та же форма в модальном окне — её открывают кнопки из шапки, тарифов и баннера. */
export function LeadModal() {
  const { content, leadOpen, closeLead } = useStore()

  return (
    <Modal open={leadOpen} onClose={closeLead} title={content.lead.title}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg">{content.lead.title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{content.lead.text}</p>
        </div>
        <button
          type="button"
          onClick={closeLead}
          aria-label="Закрыть"
          className="shrink-0 rounded-pill p-2 text-fg-subtle transition hover:bg-accent-soft hover:text-fg"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <LeadForm compact />
    </Modal>
  )
}
