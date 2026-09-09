import { useCallback, useEffect, useRef, useState } from 'react'

/** Уважаем системную настройку: при reduce анимации не проигрываются вовсе. */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReduced(mq.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

/** Появление при первом попадании во вьюпорт; повторно не проигрывается. */
export function useInView<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(!enabled)

  useEffect(() => {
    // Без наблюдателя (или при выключенной анимации) показываем сразу: контент
    // важнее эффекта, и пустая страница из-за неподдержанного API недопустима.
    if (!enabled || typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  return { ref, inView }
}

/** Счётчик от нуля до target с затуханием; запускается по active. */
export function useCountUp(target: number, active: boolean, durationMs = 1100) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      setValue(Math.round(target * (1 - (1 - progress) ** 3)))
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, durationMs])
  return value
}

export type ThemeMode = 'light' | 'dark'

const THEME_KEY = 'gravity-landing-theme'

/**
 * Тема сайта. По умолчанию тёмная — на ней построена вся композиция, включая
 * гравитационную сцену. Выбор пользователя запоминается.
 */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null
    return saved === 'light' || saved === 'dark' ? saved : 'dark'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggle = useCallback(() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')), [])
  return { theme, toggle }
}

/** Прокрутили ли страницу дальше порога — для «сжатия» шапки. */
export function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [threshold])
  return scrolled
}
