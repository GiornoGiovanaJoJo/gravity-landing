import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { useInView, usePrefersReducedMotion } from '@/lib/hooks'
import { Icon } from '@/ui/Icon'

/**
 * Примитивы страницы про кабинеты застройщика и брокера.
 *
 * Свои, а не общие с главной: там кнопки-пилюли, лёгкие заголовки капсом и
 * стеклянный декор студии, здесь — плотная деловая типографика и один мятный
 * акцент. Свести их к одному набору с флагами значит получить компонент,
 * который умеет выглядеть двумя несовместимыми способами.
 */

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
  'group inline-flex shrink-0 items-center justify-center gap-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-60'

/**
 * Основная кнопка одного цвета на всей странице — циан с тёмно-синей подписью.
 *
 * Заливка берётся из --accent-fill, а не из --accent: цианом на белом можно
 * заливать, но нельзя писать (1.5:1), поэтому текстовый акцент — бирюза. На
 * тёмной панели они совпадают, и кнопка выглядит одинаково везде.
 */
const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-accent-fill text-[#08152b] hover:brightness-105 active:brightness-95',
  outline: 'border border-accent/50 text-accent hover:border-accent hover:bg-accent-soft',
  ghost: 'text-fg-muted hover:bg-accent-soft hover:text-fg',
}

const BUTTON_SIZES = {
  sm: 'h-9 px-4',
  md: 'h-11 px-5',
  lg: 'h-12 px-6 text-[15px]',
}

/** Стрелка в подписи кнопки не нужна — цвет и так выделяет её на странице. */

interface ButtonProps {
  variant?: ButtonVariant
  size?: keyof typeof BUTTON_SIZES
  className?: string
  children: ReactNode
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  onClick,
}: ButtonProps & { href: string; onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
    >
      {children}
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
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* Поверхности и текст                                                 */
/* ------------------------------------------------------------------ */

/**
 * Карточка. `tint` — фирменная светло-голубая заливка с бирюзовой полосой
 * слева; на тёмной панели она не используется, там работает обычная поверхность.
 */
export function Card({
  className,
  children,
  tint = false,
  hoverable = false,
}: {
  className?: string
  children: ReactNode
  tint?: boolean
  hoverable?: boolean
}) {
  return (
    <div
      className={cn(
        tint ? 'b-card' : 'surface rounded-2xl',
        hoverable && 'transition-colors duration-300 hover:border-line-strong',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('b-eyebrow', className)}>{children}</p>
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
    <Reveal className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-5xl', className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      {/* Короткая бирюзовая линия над заголовком — приём из коммерческих
          материалов: она отбивает раздел, не занимая отдельной строки. */}
      <span aria-hidden="true" className="mb-4 block h-1 w-12 rounded-full bg-accent" />
      <h2 className="b-headline text-balance">{title}</h2>
      {subtitle && <p className="mt-3 max-w-xl text-sm text-fg-muted text-pretty">{subtitle}</p>}
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
    <section id={id} className={cn('relative mx-auto w-full max-w-7xl px-5 py-16 sm:px-8', className)}>
      {children}
    </section>
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

/* ------------------------------------------------------------------ */
/* Знак                                                                */
/* ------------------------------------------------------------------ */

/** Тот же знак, что на главной, но набран плотнее — под деловой заголовок. */
export function Logo({ className, name = 'G-NEURO' }: { className?: string; name?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg width="26" height="26" viewBox="0 0 28 28" fill="none" aria-hidden="true" className="shrink-0">
        <ellipse
          cx="14"
          cy="14"
          rx="12"
          ry="6"
          transform="rotate(-35 14 14)"
          stroke="currentColor"
          strokeOpacity="0.5"
          strokeWidth="1.2"
        />
        <circle cx="20.5" cy="7.5" r="3.2" fill="currentColor" />
      </svg>
      <span className="text-[17px] font-bold tracking-[0.08em] uppercase">{name}</span>
    </span>
  )
}
