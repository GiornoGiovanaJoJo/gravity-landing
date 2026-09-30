import { cn } from '@/lib/cn'

/**
 * Знак студии: точка на орбите.
 *
 * Отсылка к полёту читается геометрией — эллипс траектории и светлая точка,
 * ушедшая с неё вверх. Ни ракет, ни звёзд: намёк должен угадываться, а не
 * объявляться.
 */
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
