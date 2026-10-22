import { useState } from 'react'
import { submitLead, type LeadResult } from '@/lib/api'
import { isContactUsable, splitContact } from '@/lib/contact'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/cn'
import { Icon } from '@/ui/Icon'
import { SignalScene } from '@/ui/decor'
import { Button, Card, Field, Modal, Pill, Reveal, Section } from '@/ui/primitives'

/**
 * Форма заявки.
 *
 * Переключатель «что вас интересует» стоит первым и заполнен по умолчанию:
 * он не столько уточняет задачу, сколько показывает человеку, что мы делаем и
 * то и другое. Ответ уезжает в комментарий лида — менеджер видит, к какому
 * разговору готовиться, ещё до первого звонка.
 *
 * Контакт одним полем: телефон или почта, что удобнее. Обязательны только имя,
 * контакт и согласие — всё остальное выясняется в разговоре.
 */
function LeadForm({ compact = false }: { compact?: boolean }) {
  const { content } = useStore()
  const lead = content.lead
  const contacts = content.contacts

  const [interest, setInterest] = useState(lead.interests[0] ?? '')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [task, setTask] = useState('')
  const [consent, setConsent] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | LeadResult>('idle')

  const sending = state === 'sending'
  const ready = name.trim().length > 1 && isContactUsable(contact) && consent

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
        <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
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
          <legend className="mb-3 text-sm text-fg-muted">{lead.interestLabel}</legend>
          <div className={cn('flex flex-wrap gap-2', compact && 'gap-1.5')}>
            {lead.interests.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={interest === option}
                onClick={() => setInterest(option)}
                className={cn(
                  'flex-1 rounded-pill border px-4 py-2.5 text-sm whitespace-nowrap transition',
                  interest === option
                    ? 'border-accent-fill bg-accent-fill text-accent-contrast'
                    : 'border-line text-fg-muted hover:border-line-strong hover:text-fg',
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <Field label="Имя" name="name" value={name} onChange={setName} required autoComplete="name" />
      <Field label="Телефон или email" name="contact" value={contact} onChange={setContact} required />
      <Field label="Краткое описание задачи" name="task" value={task} onChange={setTask} multiline rows={2} />

      {/*
        Согласие — отдельная галочка, а не строка мелким шрифтом под кнопкой.
        Заявка уезжает в CRM с телефоном и почтой, и согласие на их обработку
        должно быть действием человека, а не следствием нажатия «отправить».
      */}
      <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-fg-muted">
        {/*
          Флажок нарисован, а не системный: системный окрашивается браузером по
          accent-color и на тёмной теме получается светлым пятном, которое не
          попадает ни в одну из двух палитр.
        */}
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="mt-px flex size-4.5 shrink-0 items-center justify-center rounded-[5px] border border-line-strong text-accent-contrast transition peer-checked:border-accent-fill peer-checked:bg-accent-fill peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent"
        >
          {/* Галочка ставится React, а не `peer-checked`: вариант `peer-*`
              действует на соседей самого поля, а здесь она лежит внутри
              соседа и правило до неё не достаёт. */}
          {consent && (
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12.5l5.5 5.5L20 6.5" />
            </svg>
          )}
        </span>
        <span>
          {lead.consent}
          {contacts.privacyUrl && (
            <>
              {' '}
              <a
                href={contacts.privacyUrl}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2 hover:text-fg"
              >
                Политика
              </a>
            </>
          )}
        </span>
      </label>

      {(state === 'error' || state === 'not-configured') && (
        <p className="rounded-xl border border-line bg-accent-soft px-4 py-3 text-xs text-fg-muted">
          {state === 'not-configured'
            ? lead.fallbackText
            : 'Не удалось отправить заявку. Попробуйте ещё раз или напишите нам напрямую.'}
          {(contacts.phone || contacts.email) && (
            <span className="mt-1 block text-fg">
              {contacts.phone} {contacts.phone && contacts.email ? '·' : ''} {contacts.email}
            </span>
          )}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={sending || !ready}>
        {sending ? 'Отправляем…' : lead.submitLabel}
      </Button>
    </form>
  )
}

export function Lead() {
  const { content } = useStore()
  const lead = content.lead
  const contacts = content.contacts

  const hasContacts = Boolean(contacts.phone || contacts.email || contacts.address)
  const hasChannels = Boolean(contacts.telegram || contacts.whatsapp)

  return (
    <Section id="lead" className="border-t border-line">
      <Reveal className="relative max-w-3xl">
        <p className="eyebrow">{lead.eyebrow}</p>
        <h2 className="display-sm mt-6 text-balance">{lead.title}</h2>
        {lead.subtitle && <p className="mt-5 max-w-xl text-fg-muted text-pretty">{lead.subtitle}</p>}
      </Reveal>

      <div className="relative mt-14 grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        {/*
          Левая колонка не пустеет, даже пока контакты не заполнены в админке:
          её держит видеоцикл макета. Раньше раскладка переключалась между
          одной и двумя колонками в зависимости от содержимого — теперь делить
          экран пополам можно всегда.
        */}
        <div>
          <Reveal>
            <SignalScene
              label="Сигнал заявки: узлы и связи, по которым идёт ответ"
              className="aspect-[7/3] w-full rounded-card border border-line"
            />
          </Reveal>

          {hasContacts && (
            <Reveal delayMs={80}>
              <dl className="mt-9 grid gap-8 sm:grid-cols-3">
                {contacts.phone && (
                  <ContactBlock
                    label="Телефон"
                    value={contacts.phone}
                    href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`}
                  />
                )}
                {contacts.email && (
                  <ContactBlock label="Email" value={contacts.email} href={`mailto:${contacts.email}`} />
                )}
                {contacts.address && <ContactBlock label="Адрес" value={contacts.address} />}
              </dl>
            </Reveal>
          )}

          {hasChannels && (
            <Reveal delayMs={140}>
              <div className="mt-9 flex flex-wrap gap-2.5">
                {contacts.telegram && (
                  <Pill href={contacts.telegram} external>
                    Telegram
                  </Pill>
                )}
                {contacts.whatsapp && (
                  <Pill href={contacts.whatsapp} external>
                    WhatsApp
                  </Pill>
                )}
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
      <dt className="mono-label">{label}</dt>
      <dd className="mt-2.5 font-mono text-sm">
        {href ? (
          <a href={href} className="transition hover:text-accent">
            {value}
          </a>
        ) : (
          <span className="text-pretty">{value}</span>
        )}
      </dd>
    </div>
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
