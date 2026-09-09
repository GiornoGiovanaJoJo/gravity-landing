import { cn } from '@/lib/cn'

/**
 * Знак студии: точка на орбите.
 *
 * Отсылка к полёту читается геометрией — эллипс траектории и светлая точка,
 * ушедшая с неё вверх. Ни ракет, ни звёзд: намёк должен угадываться, а не
 * объявляться.
 */
export function Logo({ className, name = 'GNERO' }: { className?: string; name?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
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
      <span className="text-[15px] font-medium tracking-[0.16em] uppercase">{name}</span>
    </span>
  )
}

/** Тонкая сетка на фоне — задаёт техничность, но не спорит с контентом. */
export function GridLines({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <svg className="absolute inset-0 size-full opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-cell" width="72" height="72" patternUnits="userSpaceOnUse">
            <path d="M72 0H0V72" fill="none" stroke="currentColor" strokeWidth="1" className="text-line" />
          </pattern>
          <radialGradient id="grid-fade" cx="50%" cy="40%" r="70%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="grid-mask">
            <rect width="100%" height="100%" fill="url(#grid-fade)" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-cell)" mask="url(#grid-mask)" />
      </svg>
    </div>
  )
}

/** Мягкое цветное пятно под стеклом — «отсвет» объекта на фоне. */
export function Bloom({
  className,
  size = 520,
  color = 'var(--accent)',
  opacity = 0.18,
}: {
  className?: string
  size?: number
  color?: string
  opacity?: number
}) {
  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute rounded-full blur-[110px]', className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, color-mix(in oklab, ${color} 75%, transparent) 0%, transparent 70%)`,
        opacity,
      }}
    />
  )
}
