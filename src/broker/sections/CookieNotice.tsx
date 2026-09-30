import { useEffect, useState } from 'react'
import { useBrokerStore } from '../store'
import { Button } from '../ui'

const KEY = 'gravity-broker-cookie-notice'

/**
 * Уведомление о файлах cookie.
 *
 * Информирующее, а не разрешающее: на странице стоит только счётчик посещаемости
 * и нет рекламных пикселей, которые пришлось бы включать по согласию. Поэтому
 * здесь одна кнопка «Хорошо» и ссылка на политику — предлагать выбор, который
 * ни на что не влияет, нечестно.
 *
 * Показывается после первого кадра: баннер, перекрывающий первый экран сразу
 * при загрузке, портит и оценку скорости, и первое впечатление.
 */
export function CookieNotice() {
  const { content } = useBrokerStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof localStorage === 'undefined') return
    if (localStorage.getItem(KEY)) return
    const timer = setTimeout(() => setVisible(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  const accept = () => {
    localStorage.setItem(KEY, String(Date.now()))
    setVisible(false)
  }

  return (
    <div
      role="region"
      aria-label="Уведомление о файлах cookie"
      /* На узком экране плашка встаёт над кнопкой демо-доступа: обе прижаты
         к низу, и без отступа они перекрывают друг друга. */
      className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-2xl rounded-2xl border border-line bg-bg-elevated p-4 shadow-xl sm:right-auto sm:bottom-6 sm:left-6 sm:mx-0"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="text-sm text-fg-muted text-pretty">
          Мы используем файлы cookie, чтобы считать посещаемость страницы.{' '}
          {content.legal.privacyUrl && (
            <a
              href={content.legal.privacyUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 hover:text-fg"
            >
              Политика конфиденциальности
            </a>
          )}
        </p>
        <Button size="sm" onClick={accept} className="shrink-0">
          Хорошо
        </Button>
      </div>
    </div>
  )
}
