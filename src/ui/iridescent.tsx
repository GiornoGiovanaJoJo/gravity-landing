import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/lib/hooks'

/**
 * Иридесцентные объекты — главный визуальный приём сайта.
 *
 * Это не картинки и не 3D-движок, а слоёный CSS: тёмное хромированное тело,
 * поверх — переливающийся конический градиент, сверху блики и внутренние тени.
 * Такой объект весит ноль килобайт, масштабируется без потерь и одинаково
 * выглядит в любой теме, а главное — не требует ни WebGL, ни тяжёлых текстур.
 */

interface BlobProps {
  className?: string
  /** Размер стороны в пикселях (объект вписан в квадрат). */
  size?: number
  /** Сдвиг фазы перелива, чтобы соседние объекты не были одинаковыми. */
  seed?: number
  /** Сила отклика на курсор: 0 — неподвижен. */
  parallax?: number
  style?: CSSProperties
}

/**
 * Скруглённый «слиток» стекла — форма из референса: между кубом и каплей.
 * Squircle рисуется одним border-radius, поэтому дешёв для композитора.
 */
export function GlassSlab({ className, size = 320, seed = 0, parallax = 14, style }: BlobProps) {
  const offset = usePointerParallax(parallax)
  const reduced = usePrefersReducedMotion()

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute', className)}
      style={{
        width: size,
        height: size,
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: 'transform 900ms cubic-bezier(0.22, 1, 0.36, 1)',
        ...style,
      }}
    >
      <div
        className={cn('iridescent-slab size-full', !reduced && 'animate-drift')}
        style={{ ['--seed' as string]: `${seed}deg` }}
      />
    </div>
  )
}

/** Сфера того же материала — для акцентов помельче. */
export function GlassOrb({ className, size = 180, seed = 120, parallax = 22, style }: BlobProps) {
  const offset = usePointerParallax(parallax)
  const reduced = usePrefersReducedMotion()

  return (
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute', className)}
      style={{
        width: size,
        height: size,
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: 'transform 1100ms cubic-bezier(0.22, 1, 0.36, 1)',
        ...style,
      }}
    >
      <div
        className={cn('iridescent-orb size-full', !reduced && 'animate-drift-slow')}
        style={{ ['--seed' as string]: `${seed}deg` }}
      />
    </div>
  )
}

/**
 * Мягкое смещение вслед за курсором.
 *
 * Объекты чуть сдвигаются относительно движения мыши — этого достаточно, чтобы
 * сцена ощущалась живой. Никакой погони за курсором: движение измеряется
 * десятками пикселей и полностью отключается при prefers-reduced-motion.
 */
function usePointerParallax(strength: number) {
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const reduced = usePrefersReducedMotion()
  const frame = useRef(0)

  useEffect(() => {
    if (reduced || strength === 0) return
    const onMove = (e: PointerEvent) => {
      if (frame.current) return
      frame.current = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.5) * 2
        const ny = (e.clientY / window.innerHeight - 0.5) * 2
        setOffset({ x: nx * strength, y: ny * strength })
        frame.current = 0
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [reduced, strength])

  return offset
}

/**
 * Тонкая линейная графика на фоне: траектории, уходящие за край экрана.
 *
 * Отсылка к полёту и орбите держится на геометрии, а не на иллюстрациях ракет —
 * так намёк читается, но не превращается в тему оформления.
 */
export function TrajectoryLines({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 size-full', className)}
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="trajectory-fade" x1="0" y1="0" x2="1440" y2="900" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="0.45" stopColor="var(--accent)" stopOpacity="0.5" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M-120 760 C 320 720, 560 420, 1560 60" stroke="url(#trajectory-fade)" strokeWidth="1" />
      <path d="M-120 900 C 420 860, 760 520, 1560 220" stroke="url(#trajectory-fade)" strokeWidth="1" opacity="0.6" />
      <ellipse
        cx="720"
        cy="450"
        rx="620"
        ry="300"
        transform="rotate(-16 720 450)"
        stroke="var(--line-strong)"
        strokeWidth="1"
        strokeDasharray="2 10"
        opacity="0.55"
      />
    </svg>
  )
}
