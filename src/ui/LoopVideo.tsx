import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/lib/hooks'

const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`

/**
 * Фоновый видеоцикл макета.
 *
 * Четыре таких блока — первый экран, платформа продуктов, форма и футер —
 * несут весь «живой» слой сайта. Отсюда три правила, которые дешевле соблюсти
 * один раз здесь, чем четыре раза по месту:
 *
 * 1. Ничего не грузится, пока блок не показался: `preload="none"` плюс
 *    подстановка `<source>` только после попадания во вьюпорт. Иначе страница
 *    тянет мегабайты ради футера, до которого человек может не дойти.
 * 2. За экраном видео встаёт на паузу — и при уходе из вьюпорта, и при уходе
 *    со вкладки. Невидимое видео продолжает декодироваться и греет батарею.
 * 3. При `prefers-reduced-motion` остаётся только постер.
 *
 * Автозапуск умеет запретить и сам браузер (в iOS это политика экономии
 * энергии, а не ошибка). Тогда показывается кнопка запуска — беззвучный цикл
 * без неё просто не начнётся, и на месте визуала осталась бы статичная рамка
 * без объяснения.
 */
export function LoopVideo({
  name,
  label,
  className,
  videoClassName,
  objectPosition,
}: {
  /** Базовое имя пары файлов: `<name>-loop.mp4` и `<name>-poster.webp`. */
  name: 'hero' | 'products' | 'form' | 'footer'
  /** Что изображено — для тех, кто видео не видит. */
  label: string
  className?: string
  videoClassName?: string
  objectPosition?: string
}) {
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [blocked, setBlocked] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const sync = () => {
      if (reduced || !visible || document.hidden) {
        el.pause()
        return
      }
      el.play().then(
        () => setBlocked(false),
        () => setBlocked(true),
      )
    }

    sync()
    document.addEventListener('visibilitychange', sync)
    return () => document.removeEventListener('visibilitychange', sync)
  }, [visible, reduced])

  /*
   * Адрес появляется вместе с блоком: до этого у <video> нет src и качать
   * нечего, даже если браузер проигнорирует preload="none".
   *
   * Именно атрибут, а не вложенный <source>: добавленный позже <source>
   * уже отрисованный элемент не замечает — его пришлось бы будить вызовом
   * load(), и забытый вызов оставил бы на месте видео постер навсегда.
   */
  const src = visible && !reduced ? media(`${name}-loop.mp4`) : undefined

  return (
    <div className={cn('relative overflow-hidden bg-bg-soft', className)}>
      <video
        ref={ref}
        src={src}
        muted
        loop
        playsInline
        preload="none"
        poster={media(`${name}-poster.webp`)}
        aria-label={label}
        className={cn('block size-full object-cover', videoClassName)}
        style={objectPosition ? { objectPosition } : undefined}
      />

      {blocked && (
        <button
          type="button"
          onClick={() => {
            setBlocked(false)
            ref.current?.play().catch(() => setBlocked(true))
          }}
          aria-label="Включить анимацию"
          className="absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full border border-line bg-bg/80 text-fg backdrop-blur-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      )}
    </div>
  )
}
