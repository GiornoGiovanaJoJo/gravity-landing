import { useState } from 'react'
import { submitLead, type LeadResult } from '@/lib/api'
import { isContactUsable, splitContact } from '@/lib/contact'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/cn'
import { Icon } from '@/ui/Icon'
import { GlassOrb } from '@/ui/iridescent'
import { Button, Card, Field, Modal, Reveal, Section } from '@/ui/primitives'

/**
 * Форма заявки.
 *
 * Переключатель «что вас интересует» стоит первым и заполнен по умолчанию:
 * он не столько уточняет задачу, сколько показывает человеку, что мы делаем и
 * то и другое. Ответ уезжает в комментарий лида — менеджер видит, к какому
 * разговору готовиться, ещё до первого звонка.
 *
 * Контакт одним полем: телефон или почта, что удобнее. Обязательных полей два,
 * и это осознанный минимум — всё остальное выясняется в разговоре.
 */
function LeadForm({ compact = false }: { compact?: boolean }) {
  const { content } = useStore()
  const lead = content.lead
  const contacts = content.contacts

  const [interest, setInterest] = useState(lead.interests[0] ?? '')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [task, setTask] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | LeadResult>('idle')

  const sending = state === 'sending'
  const ready = name.trim().length > 1 && isContactUsable(contact)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sending || !ready) return
    setState('sending')
    const { phone, email } = splitContact(contact)
    const comment = [interest && `Интерес: ${interest}`, task.trim()].filter(Boolean).join('\n')
    setState(
      await submitLead(content.brand.formSlug, {
        name: name.trim(),
        phone,
        email,
        comment: comment || 'Заявка с сайта',
      }),
    )
  }

  if (state === 'ok') {
    return (
      <div className="py-10 text-center">
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
      {lead.interests.length > 0 && (
        <fieldset>
          <legend className="mb-2.5 text-xs text-fg-muted">{lead.interestLabel}</legend>
          <div className={cn('flex flex-wrap gap-2', compact && 'gap-1.5')}>
            {lead.interests.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={interest === option}
                onClick={() => setInterest(option)}
                className={cn(
                  'rounded-pill border px-4 py-2 text-sm transition',
                  interest === option
                    ? 'border-fg bg-fg text-bg'
                    : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <Field label="Имя" name="name" value={name} onChange={setName} placeholder="Как к вам обращаться" required autoComplete="name" />
      <Field
        label="Телефон или email"
        name="contact"
        value={contact}
        onChange={setContact}
        placeholder="+7 900 000-00-00 или name@company.ru"
        required
      />
      <Field
        label="Краткое описание задачи"
        name="task"
        value={task}
        onChange={setTask}
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

      <Button type="submit" size="lg" className="w-full" disabled={sending || !ready} arrow={!sending}>
        {sending ? 'Отправляем…' : lead.submitLabel}
      </Button>

      <p className="text-center text-[11px] leading-relaxed text-fg-subtle">
        {lead.consent}
        {contacts.privacyUrl && (
          <>
            {' '}
            <a href={contacts.privacyUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">
              Политика
            </a>
          </>
        )}
      </p>
    </form>
  )
}

export function Lead() {
  const { content } = useStore()
  const lead = content.lead
  const contacts = content.contacts

  const hasContacts = Boolean(contacts.phone || contacts.email || contacts.address)
  const hasChannels = Boolean(contacts.telegram || contacts.whatsapp)
  /*
   * Пока контакты не заполнены, левая колонка пуста, и форма в две колонки
   * висит в правой половине пустого экрана. Поэтому раскладка зависит от
   * содержимого: есть что показать слева — две колонки, нет — одна узкая по
   * центру.
   */
  const twoColumns = hasContacts || hasChannels

  return (
    <Section id="lead" className="border-t border-line">
      <GlassOrb className="top-10 right-[8%] hidden -translate-x-1/2 lg:block" size={110} seed={300} parallax={20} />

      <Reveal className="relative max-w-3xl">
        <p className="eyebrow">{lead.eyebrow}</p>
        <h2 className="mt-6 text-[length:var(--text-h2)] leading-[1.05] font-light tracking-tight text-balance uppercase">
          {lead.title}
        </h2>
        {lead.subtitle && <p className="mt-5 max-w-xl text-fg-muted text-pretty">{lead.subtitle}</p>}
      </Reveal>

      <div
        className={cn(
          'relative mt-14 grid items-start gap-10',
          twoColumns ? 'lg:grid-cols-2 lg:gap-16' : 'mx-auto max-w-xl',
        )}
      >
        <div className={twoColumns ? '' : 'hidden'}>
          {hasContacts && (
            <Reveal className="space-y-8">
              {contacts.phone && (
                <ContactBlock label="Телефон" value={contacts.phone} href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`} />
              )}
              {contacts.email && <ContactBlock label="Email" value={contacts.email} href={`mailto:${contacts.email}`} />}
              {contacts.address && <ContactBlock label="Адрес" value={contacts.address} />}
            </Reveal>
          )}

          {hasChannels && (
            <Reveal delayMs={100}>
              <div className={cn('flex flex-wrap gap-2.5', hasContacts && 'mt-10')}>
                {contacts.telegram && <ChannelLink href={contacts.telegram} label="Telegram" />}
                {contacts.whatsapp && <ChannelLink href={contacts.whatsapp} label="WhatsApp" />}
              </div>
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

function ContactBlock({ label, value, href }: { label: string; value: string; href?: string }) {
  return (
    <div>
      <p className="mono-label">{label}</p>
      {href ? (
        <a href={href} className="mt-2 block text-lg transition hover:text-accent">
          {value}
        </a>
      ) : (
        <p className="mt-2 text-lg text-pretty">{value}</p>
      )}
    </div>
  )
}

function ChannelLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="hairline inline-flex items-center rounded-pill px-5 py-2.5 text-sm text-fg-muted transition hover:border-line-strong hover:text-fg"
    >
      {label}
    </a>
  )
}

/** Та же форма в модальном окне — её открывают кнопки из шапки и разделов. */
export function LeadModal() {
  const { content, leadOpen, closeLead } = useStore()

  return (
    <Modal open={leadOpen} onClose={closeLead} title={content.lead.title}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg">{content.lead.title}</h2>
          <p className="mt-1 text-sm text-fg-muted">{content.lead.subtitle}</p>
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
