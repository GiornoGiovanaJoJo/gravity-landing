import { useEffect, useId, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useInView, usePrefersReducedMotion } from '@/lib/hooks'

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

/*
 * Выключенная кнопка перекрашивается, а не гасится прозрачностью: Electric под
 * opacity на Deep Iris превращается в грязно-синее пятно, которое читается как
 * сломанная кнопка, а не как недоступная.
 */
const BUTTON_BASE =
  'group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-pill border border-transparent text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:border-line disabled:bg-transparent disabled:text-fg-subtle disabled:shadow-none'

/**
 * Основная кнопка — заливка Electric с тёмным текстом.
 *
 * Тёмный текст, а не белый: белый на фирменном синем даёт 3.9:1 и не проходит
 * по контрасту, Deep Iris на нём же — 4.6:1. Это не вкусовое решение, поэтому
 * пара «заливка + текст» задана здесь один раз и не разбирается по месту.
 */
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent-fill text-accent-contrast hover:glow-accent',
  outline: 'border border-line text-fg hover:border-line-strong hover:bg-accent-soft',
  ghost: 'text-fg-muted hover:bg-accent-soft hover:text-fg',
}

const BUTTON_SIZES = {
  sm: 'h-10 px-5',
  md: 'h-12 px-6',
  lg: 'h-13 px-7 text-[15px]',
}

interface ButtonProps {
  variant?: ButtonVariant
  size?: keyof typeof BUTTON_SIZES
  className?: string
  children: ReactNode
  /** Стрелка после подписи — как у кнопок макета. */
  arrow?: boolean | 'up-right'
}

/** Стрелка-глиф, а не иконка из пакета: в макете это просто знак после слова. */
function Arrow({ kind }: { kind: boolean | 'up-right' }) {
  return (
    <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5">
      {kind === 'up-right' ? '↗' : '→'}
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
    <a href={href} className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}>
      {children}
      {arrow && <Arrow kind={arrow} />}
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
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
    >
      {children}
      {arrow && <Arrow kind={arrow} />}
    </button>
  )
}

/** Круглая кнопка-стрелка каруселей. */
export function RoundButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex size-12 items-center justify-center rounded-full border border-line text-fg-muted transition',
        disabled ? 'opacity-35' : 'hover:border-accent hover:text-fg',
      )}
    >
      {children}
    </button>
  )
}

/** Обводная «таблетка»: теги направлений, мессенджеры, ссылки на соцсети. */
export function Pill({
  children,
  href,
  className,
  external = false,
}: {
  children: ReactNode
  href?: string
  className?: string
  external?: boolean
}) {
  const base = cn(
    'inline-flex items-center rounded-pill border border-line px-5 py-2.5 text-sm text-fg-muted transition',
    href && 'hover:border-accent hover:text-fg',
    className,
  )
  if (!href) return <span className={base}>{children}</span>
  return (
    <a href={href} className={base} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
      {children}
    </a>
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
        'panel rounded-card',
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

/**
 * Заголовок раздела.
 *
 * Два размера, и разница между ними смысловая. `display` — капсом и во всю
 * ширину: им открываются разделы-витрины, которые видно с другого конца
 * страницы. `plain` — в обычном регистре: им подписаны разделы, где рядом с
 * заголовком сразу идёт содержательный текст, и капс читался бы вдвое дольше.
 */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  size = 'display',
  className,
  children,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  size?: 'display' | 'plain'
  className?: string
  children?: ReactNode
}) {
  return (
    <Reveal className={cn('max-w-3xl', className)}>
      {eyebrow && <Eyebrow className="mb-5">{eyebrow}</Eyebrow>}
      {size === 'display' ? (
        <h2 className="display text-balance">{title}</h2>
      ) : (
        <h2 className="text-[length:var(--text-h3)] leading-[1.1] font-light tracking-tight text-balance">
          {title}
        </h2>
      )}
      {subtitle && <p className="mt-5 max-w-xl text-fg-muted text-pretty">{subtitle}</p>}
      {children}
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
    <section id={id} className={cn('relative mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-28', className)}>
      {children}
    </section>
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
        className="absolute inset-0 bg-iris/80 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg rounded-card border border-line bg-bg-soft p-6 shadow-2xl sm:p-8"
      >
        {children}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Поле формы                                                          */
/* ------------------------------------------------------------------ */

/**
 * Поле без видимой подписи: в макете поля подписаны подсказкой внутри.
 *
 * Подпись при этом существует и доступна скринридеру — она просто скрыта
 * визуально. Это допустимо именно здесь: все три поля короткие и
 * самоочевидные («Имя», «Телефон или email»), и заполненное поле читается без
 * заголовка над ним.
 */
export function Field({
  label,
  name,
  type = 'text',
  value,
  onChange,
  required,
  multiline,
  rows = 3,
  inputMode,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  multiline?: boolean
  rows?: number
  inputMode?: 'text' | 'tel' | 'email'
  autoComplete?: string
}) {
  const id = useId()
  const shared =
    'w-full rounded-xl border border-line bg-bg px-4 text-sm text-fg outline-none transition placeholder:text-fg-subtle focus:border-accent focus:ring-2 focus:ring-accent-soft'

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          value={value}
          required={required}
          placeholder={label}
          onChange={(e) => onChange(e.target.value)}
          className={cn(shared, 'resize-none py-3.5')}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          required={required}
          placeholder={label}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          className={cn(shared, 'h-13')}
        />
      )}
    </div>
  )
}
