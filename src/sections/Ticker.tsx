import { useStore } from '@/lib/store'
import { Marquee } from '@/ui/primitives'

/**
 * Строка компетенций. CSS-анимация, а не тег <marquee>: строка останавливается
 * при наведении и полностью замирает при prefers-reduced-motion.
 */
export function Ticker() {
  const { content } = useStore()

  return (
    <div className="relative border-y border-line py-5">
      <Marquee durationSec={58}>
        <div className="flex items-center">
          {content.ticker.map((item) => (
            <span
              key={item}
              className="flex items-center gap-6 px-6 text-sm whitespace-nowrap text-fg-muted"
            >
              {item}
              <span className="size-1 rounded-full bg-accent/70" aria-hidden="true" />
            </span>
          ))}
        </div>
      </Marquee>
    </div>
  )
}
