import { useId, useRef, useState } from 'react'
import { submitLead, type LeadResult } from '@/lib/api'
import { useBrokerStore } from '../store'
import { cn } from '@/lib/cn'
import { Icon } from '@/ui/Icon'
import { track, type Goal } from '../tracking'
import { Button } from '../ui'

/**
 * Запрос демо-доступа: одно поле и кнопка.
 *
 * Одно поле, а не анкета, — потому что этим оно и продаётся: «без анкеты и
 * звонков». Каждое лишнее поле здесь стоит части заявок, а компанию, роль и
 * телефон спрашивают уже внутри демо, когда человек увидел продукт.
 *
 * Заявка уходит в ту же форму CRM, что и обычное обращение с сайта, но с
 * пометкой в комментарии: менеджер должен видеть, что человек просит доступ, а
 * не консультацию, — это разные разговоры и разная скорость ответа.
 */
export function DemoForm({
  submitLabel,
  note,
  source = 'Демо-доступ с сайта',
  goal = 'demo_lead_sent',
  className,
  compact = false,
}: {
  submitLabel: string
  note?: string
  source?: string
  goal?: Goal
  className?: string
  compact?: boolean
}) {
  const { content } = useBrokerStore()
  const legal = content.legal
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState(false)
  const [state, setState] = useState<'idle' | 'sending' | LeadResult>('idle')
  const id = useId()
  // Ловушка для ботов: поле спрятано от людей и от скринридеров, а автозаполнялка
  // роботов его находит и заполняет. Заполнено — тихо не отправляем.
  const trap = useRef<HTMLInputElement>(null)

  const sending = state === 'sending'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setTouched(true)
    if (!consent) return
    if (trap.current?.value) {
      // Боту отвечаем так же, как человеку: иначе ловушку быстро обходят.
      setState('ok')
      return
    }

    track(goal === 'deck_email_submit' ? 'deck_email_submit' : 'demo_form_submit')
    setState('sending')
    const result = await submitLead(
      content.brand.formSlug,
      { name: '', phone: '', email, comment: source },
      { consent: 'Согласие на обработку персональных данных получено' },
    )
    setState(result)
    if (result === 'ok') track(goal)
  }

  if (state === 'ok') {
    return (
      <div className={cn('flex items-start gap-3 rounded-2xl border border-line p-4', className)}>
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Icon name="Check" className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">{content.lead.successTitle}</p>
          <p className="mt-1 text-sm text-fg-muted text-pretty">
            Письмо с доступами уйдёт на {email || 'указанную почту'}. 14 дней начнутся с первого входа.
          </p>
        </div>
      </div>
    )
  }

  const consentMissing = touched && !consent

  return (
    <div className={className}>
      <form onSubmit={onSubmit} noValidate>
        <div className={cn('flex flex-col gap-3', !compact && 'sm:flex-row')}>
          <label htmlFor={id} className="sr-only">
            Рабочий e-mail
          </label>
          <input
            id={id}
            type="email"
            name="email"
            value={email}
            required
            autoComplete="email"
            inputMode="email"
            placeholder="Рабочий e-mail"
            onFocus={() => track('demo_form_open')}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 w-full flex-1 rounded-xl border border-line bg-bg px-4 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent"
          />
          <input
            ref={trap}
            type="text"
            name="company_site"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="pointer-events-none absolute -left-[9999px] size-0 opacity-0"
          />
          <Button type="submit" size="lg" disabled={sending} className="shrink-0">
            {sending ? 'Отправляем…' : submitLabel}
          </Button>
        </div>

        <label className="mt-3 flex items-start gap-2.5 text-xs leading-relaxed text-fg-subtle">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            aria-invalid={consentMissing}
            className="mt-0.5 size-4 shrink-0 accent-[var(--accent-fill)]"
          />
          <span>
            Согласен на обработку персональных данных{' '}
            {legal.consentUrl && (
              <>
                (<LegalLink href={legal.consentUrl}>согласие</LegalLink>
                {legal.privacyUrl && (
                  <>
                    , <LegalLink href={legal.privacyUrl}>политика</LegalLink>
                  </>
                )}
                )
              </>
            )}
          </span>
        </label>
        {consentMissing && (
          <p role="alert" className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
            Без согласия отправить заявку нельзя.
          </p>
        )}
      </form>

      {(state === 'error' || state === 'not-configured') && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{content.lead.fallbackText}</p>
      )}
      {note && state === 'idle' && <p className="mt-3 max-w-lg text-xs text-fg-subtle text-pretty">{note}</p>}
    </div>
  )
}

function LegalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-fg">
      {children}
    </a>
  )
}
