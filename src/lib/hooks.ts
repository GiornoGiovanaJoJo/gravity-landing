import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

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

/**
 * Счётчик от нуля до target с затуханием; запускается по active.
 *
 * `decimals` — сколько знаков после запятой держать: показатели бывают не
 * только целыми («3,2 ч»), и округление до целого превратило бы их в другое
 * число.
 *
 * При выключенной анимации возвращает конечное значение сразу. Это не
 * тонкость, а условие: человек, попросивший меньше движения, просил убрать
 * анимацию, а не цифры — иначе на витрине остались бы нули.
 */
export function useCountUp(target: number, active: boolean, { decimals = 0, durationMs = 1100 } = {}) {
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(() => (reduced ? target : 0))

  useEffect(() => {
    if (!active) return
    if (reduced) {
      setValue(target)
      return
    }

    const factor = 10 ** decimals
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1)
      // easeOutCubic: быстрый разгон и мягкая остановка — счётчик не выглядит
      // равномерной прокруткой табло.
      setValue(Math.round(target * (1 - (1 - progress) ** 3) * factor) / factor)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target, durationMs, decimals, reduced])

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

  /*
   * Тема перетекает, а не переключается рывком.
   *
   * View Transitions снимают кадр до и после правки и растворяют один в
   * другой. Глобальный `transition: background-color` сделал бы то же грубее:
   * он навсегда замедлил бы каждое наведение на странице, а здесь переход
   * одноразовый и к элементам не относится вовсе.
   *
   * flushSync обязателен: startViewTransition снимает первый кадр, вызывает
   * колбэк и сразу снимает второй. Обычная правка состояния React отложила бы
   * изменение DOM на после съёмки, и переход честно отработал бы между двумя
   * одинаковыми кадрами — то есть внешне не произошло бы ничего.
   */
  const toggle = useCallback(() => {
    const flip = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
    const start = document.startViewTransition?.bind(document)
    if (!start || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      flip()
      return
    }
    start(() => flushSync(flip))
  }, [])

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
