import { useEffect, useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useInView, usePrefersReducedMotion } from '@/lib/hooks'
import { Icon } from './Icon'

/* ------------------------------------------------------------------ */
/* Появление при скролле                                               */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  className,
  delayMs = 0,
}: {
  children: ReactNode
  className?: string
  delayMs?: number
}) {
  const reduced = usePrefersReducedMotion()
  const { ref, inView } = useInView<HTMLDivElement>(!reduced)
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        'transition-all duration-700 ease-out',
        inView ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Кнопки                                                              */
/* ------------------------------------------------------------------ */

type ButtonVariant = 'primary' | 'outline' | 'ghost'

const BUTTON_BASE =
  'group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-pill text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-60'

/**
 * Основная кнопка — контрастная плашка цветом текста: белая на тёмном фоне и
 * чёрная на светлом. Это самый читаемый вариант в обеих темах и он же держит
 * минимализм макета, где цвет остаётся только на стеклянных объектах.
 */
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-fg text-bg hover:opacity-90 active:opacity-100',
  outline: 'hairline surface text-fg hover:border-line-strong hover:bg-accent-soft',
  ghost: 'text-fg-muted hover:bg-accent-soft hover:text-fg',
}

const BUTTON_SIZES = {
  sm: 'h-9 px-4',
  md: 'h-11 px-5',
  lg: 'h-12 px-6 text-[15px]',
}

interface ButtonProps {
  variant?: ButtonVariant
  size?: keyof typeof BUTTON_SIZES
  className?: string
  children: ReactNode
  /** Кружок со стрелкой справа — фирменная деталь кнопок студии. */
  arrow?: boolean
}

function ArrowDot({ variant }: { variant: ButtonVariant }) {
  return (
    <span
      className={cn(
        'flex size-6 items-center justify-center rounded-full transition-transform duration-200 group-hover:translate-x-0.5',
        variant === 'primary' ? 'bg-bg/15' : 'bg-accent-soft',
      )}
    >
      <Icon name="ArrowRight" className="size-3.5" />
    </span>
  )
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  arrow = false,
}: ButtonProps & { href: string }) {
  return (
    <a
      href={href}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], arrow && 'pr-2', className)}
    >
      {children}
      {arrow && <ArrowDot variant={variant} />}
    </a>
  )
}

export function Button({
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  children,
  arrow = false,
}: ButtonProps & {
  onClick?: () => void
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], arrow && 'pr-2', className)}
    >
      {children}
      {arrow && <ArrowDot variant={variant} />}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Поверхности и текст                                                 */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  children,
  hoverable = false,
}: {
  className?: string
  children: ReactNode
  hoverable?: boolean
}) {
  return (
    <div
      className={cn(
        'surface rounded-card',
        hoverable && 'transition-colors duration-300 hover:border-line-strong',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('eyebrow', className)}>{children}</p>
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}) {
  return (
    <Reveal className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-3xl', className)}>
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="text-[length:var(--text-h2)] leading-[1.05] font-light tracking-tight text-balance uppercase">
        {title}
      </h2>
      {subtitle && <p className="mt-5 max-w-xl text-fg-muted text-pretty">{subtitle}</p>}
    </Reveal>
  )
}

export function Section({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  return (
    <section id={id} className={cn('relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32', className)}>
      {children}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/* Лента                                                               */
/* ------------------------------------------------------------------ */

/**
 * Бесконечная лента на CSS-анимации: содержимое дублируется один раз, трек
 * уезжает на -50%, стык незаметен. При наведении лента замирает, чтобы её можно
 * было прочитать.
 */
export function Marquee({
  children,
  durationSec = 44,
  reverse = false,
  className,
}: {
  children: ReactNode
  durationSec?: number
  reverse?: boolean
  className?: string
}) {
  return (
    <div className={cn('fade-edges-x overflow-hidden', className)}>
      <div
        className={cn('marquee-track', reverse ? 'animate-marquee-reverse' : 'animate-marquee')}
        style={{ '--marquee-duration': `${durationSec}s` } as React.CSSProperties}
      >
        {children}
        <div aria-hidden="true" className="flex">
          {children}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Аккордеон                                                           */
/* ------------------------------------------------------------------ */

export function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="border-b border-line last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-6 py-6 text-left text-base transition hover:text-accent"
        >
          {question}
          <span
            className={cn(
              'flex size-8 shrink-0 items-center justify-center rounded-full border border-line transition-transform duration-300',
              open && 'rotate-180 border-accent text-accent',
            )}
          >
            <Icon name="ChevronDown" className="size-4" />
          </span>
        </button>
      </h3>
      <div id={id} role="region" hidden={!open} className={cn(open && 'pb-6')}>
        <p className="max-w-3xl text-sm leading-relaxed text-fg-muted text-pretty">{answer}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Модальное окно                                                      */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-100 flex items-end justify-center p-4 sm:items-center">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="hairline relative w-full max-w-lg rounded-card bg-bg-elevated p-6 shadow-2xl sm:p-8"
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Поле формы                                                          */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  multiline,
  inputMode,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  multiline?: boolean
  inputMode?: 'text' | 'tel' | 'email'
  autoComplete?: string
}) {
  const id = useId()
  const shared =
    'w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent'

  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs text-fg-muted">
        {label}
        {required && <span className="ml-0.5 text-accent">*</span>}
      </span>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={3}
          value={value}
          required={required}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn(shared, 'resize-none')}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          required={required}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={shared}
        />
      )}
    </label>
  )
}
