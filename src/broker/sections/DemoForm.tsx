import { useId, useState } from 'react'
import { submitLead, type LeadResult } from '@/lib/api'
import { useBrokerStore } from '../store'
import { cn } from '@/lib/cn'
import { Icon } from '@/ui/Icon'
import { Button } from '../ui'

/**
 * Запрос демо-доступа: одно поле и кнопка.
 *
 * Одно поле, а не анкета, — потому что этим она и продаётся: «без анкеты и
 * звонков». Каждое лишнее поле здесь стоит части заявок, а всё остальное
 * (имя, компанию, телефон) менеджер спросит в ответном письме, если понадобится.
 *
 * Заявка уходит в ту же форму CRM, что и обычное обращение с сайта, но с
 * пометкой в комментарии: менеджер должен видеть, что человек просит доступ, а
 * не консультацию, — это разные разговоры и разная скорость ответа.
 */
export function DemoForm({
  submitLabel,
  note,
  source = 'Демо-доступ с сайта',
  className,
}: {
  submitLabel: string
  note?: string
  source?: string
  className?: string
}) {
  const { content } = useBrokerStore()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'sending' | LeadResult>('idle')
  const id = useId()

  const sending = state === 'sending'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (sending) return
    setState('sending')
    setState(
      await submitLead(content.brand.formSlug, {
        name: '',
        phone: '',
        email,
        comment: source,
      }),
    )
  }

  if (state === 'ok') {
    return (
      <div className={cn('flex items-start gap-3 rounded-2xl border border-line p-4', className)}>
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
          <Icon name="Check" className="size-4" />
        </span>
        <div>
          <p className="text-sm font-medium">{content.lead.successTitle}</p>
          <p className="mt-1 text-sm text-fg-muted text-pretty">
            Отправили заявку на доступ. Ответим на {email || 'указанную почту'} в ближайшее рабочее время.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
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
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full flex-1 rounded-xl border border-line bg-bg px-4 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent"
        />
        <Button type="submit" size="lg" disabled={sending} className="shrink-0">
          {sending ? 'Отправляем…' : submitLabel}
        </Button>
      </form>

      {state === 'error' && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{content.lead.fallbackText}</p>
      )}
      {state === 'not-configured' && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">{content.lead.fallbackText}</p>
      )}
      {note && state === 'idle' && <p className="mt-4 max-w-lg text-xs text-fg-subtle text-pretty">{note}</p>}
    </div>
  )
}
