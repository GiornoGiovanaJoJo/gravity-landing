import { cn } from '@/lib/cn'

/**
 * Знак студии из утверждённого макета: контурная надпись «G-neur» и
 * нейро-медуза вместо последней буквы.
 *
 * Картинкой, а не инлайновым SVG: внутри фильтры свечения и полсотни контуров,
 * и в разметке это полсотни килобайт в каждом месте, где стоит логотип. Файл
 * браузер возьмёт из кэша один раз на весь сайт.
 *
 * Буквы залиты Deep Iris и обведены Electric, поэтому знак читается в обеих
 * темах: на светлом фоне его держит заливка, на тёмном — обводка.
 *
 * Свечение из макета рисуется здесь тенью и только в тёмной теме. В самом
 * файле оно было фильтром с режимом soft-light, а такой фильтр поверх светлого
 * фона превращается в серый прямоугольник вокруг знака.
 */
export function Logo({ className, name = 'G-NEURO' }: { className?: string; name?: string }) {
  return (
    <img
      src={`${import.meta.env.BASE_URL}media/brand.svg`}
      alt={name}
      width={162}
      height={44}
      className={cn(
        'block h-10 w-auto select-none sm:h-11',
        'dark:drop-shadow-[0_0_10px_color-mix(in_oklab,var(--electric)_55%,transparent)]',
        className,
      )}
    />
  )
}

/**
 * Светящаяся звезда последнего экрана.
 *
 * Была роликом на 740 КБ, хотя всё, что в нём происходило, — четырёхлучевой
 * блик с ореолом, слегка пульсирующий. Такой кадр рисуется кривой и парой
 * градиентов и остаётся резким на любом экране.
 *
 * Цвет при этом стал фирменным: в ролике звезда была красно-оранжевой и
 * единственной тёплой вещью на сайте — на последнем экране это читалось как
 * чужая картинка, а не как знак студии.
 *
 * Ореол — размытая копия той же фигуры, а не SVG-фильтр: `feGaussianBlur`
 * пересчитывается процессором на каждом кадре пульсации, а `filter: blur()`
 * браузер кладёт на видеокарту и кэширует слоем.
 */
export function StarBloom({ className, label }: { className?: string; label: string }) {
  return (
    <div className={cn('relative grid place-items-center overflow-hidden bg-bg-soft', className)} role="img" aria-label={label}>
      <svg viewBox="0 0 200 200" className="size-[78%]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="star-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.35" stopColor="#bfe3ff" />
            <stop offset="0.7" stopColor="#2e86de" />
            <stop offset="1" stopColor="#1b63ad" />
          </radialGradient>
          <radialGradient id="star-halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#2e86de" stopOpacity="0.85" />
            <stop offset="0.6" stopColor="#f0b35a" stopOpacity="0.35" />
            <stop offset="1" stopColor="#2e86de" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="100" cy="100" r="92" fill="url(#star-halo)" className="hero-pulse blur-[18px]" />
        <path
          d="M100 8C108 54 146 92 192 100C146 108 108 146 100 192C92 146 54 108 8 100C54 92 92 54 100 8Z"
          fill="url(#star-core)"
          className="blur-[9px]"
          opacity="0.75"
        />
        <path
          d="M100 8C108 54 146 92 192 100C146 108 108 146 100 192C92 146 54 108 8 100C54 92 92 54 100 8Z"
          fill="url(#star-core)"
        />
      </svg>
    </div>
  )
}

/** Узлы сцены обратной связи: доля ширины, доля высоты и размер точки. */
const SIGNAL_NODES = [
  { x: 120, y: 70, r: 7, delay: '0s' },
  { x: 96, y: 168, r: 5, delay: '-1.4s' },
  { x: 186, y: 236, r: 6, delay: '-2.6s' },
  { x: 548, y: 66, r: 6, delay: '-0.8s' },
  { x: 602, y: 158, r: 8, delay: '-3.2s' },
  { x: 500, y: 240, r: 5, delay: '-2s' },
]

/**
 * Сцена обратной связи у формы заявки.
 *
 * Вместо ролика на 2,4 МБ с неоновой головой: заявка — это сигнал, который
 * доходит до нас и возвращается ответом, и рисуется он узлами и бегущим по
 * связям пунктиром. Прежний кадр был не только тяжёлым, но и красным —
 * единственным тёплым пятном на синем сайте.
 *
 * Пунктир бежит готовым `link-flow` — тем же, которым связаны значки в блоке
 * разработки: одно движение на весь сайт лучше двух похожих.
 */
export function SignalScene({ className, label }: { className?: string; label: string }) {
  return (
    <div
      className={cn('relative overflow-hidden bg-bg-soft', className)}
      role="img"
      aria-label={label}
    >
      <svg viewBox="0 0 700 300" preserveAspectRatio="xMidYMid slice" className="size-full" aria-hidden="true">
        <defs>
          <radialGradient id="signal-core" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.4" stopColor="#bfe3ff" />
            <stop offset="1" stopColor="var(--electric)" />
          </radialGradient>
          <radialGradient id="signal-halo" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="var(--electric)" stopOpacity="0.5" />
            <stop offset="1" stopColor="var(--electric)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="350" cy="150" r="150" fill="url(#signal-halo)" className="hero-pulse" />

        {SIGNAL_NODES.map((node) => (
          <g key={`${node.x}-${node.y}`}>
            <line
              x1="350"
              y1="150"
              x2={node.x}
              y2={node.y}
              stroke="var(--electric)"
              strokeOpacity="0.45"
              strokeWidth="1.5"
              strokeDasharray="6 7"
              className="animate-link-flow"
              style={{ animationDelay: node.delay }}
            />
            <circle cx={node.x} cy={node.y} r={node.r} fill="var(--electric)" className="blur-[3px]" />
            <circle cx={node.x} cy={node.y} r={node.r * 0.55} fill="#dbeeff" />
          </g>
        ))}

        <circle cx="350" cy="150" r="34" fill="url(#signal-core)" className="blur-[10px]" opacity="0.8" />
        <circle cx="350" cy="150" r="22" fill="url(#signal-core)" />
      </svg>
    </div>
  )
}

/**
 * Мягкое электрическое пятно на фоне — отсвет объектов сцены.
 *
 * `alive` включает очень медленный ход: пятно дышит и слегка смещается при
 * прокрутке. Без него фон остаётся ровно таким, каким был, — поэтому движение
 * добавляется по месту, а не всем пятнам разом.
 */
export function Bloom({
  className,
  size = 520,
  color = 'var(--electric)',
  opacity = 0.18,
  alive = false,
  drift = 'slow',
}: {
  className?: string
  size?: number
  color?: string
  opacity?: number
  alive?: boolean
  /** Направление параллакса: встречное движение добавляет глубины. */
  drift?: 'slow' | 'counter'
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute rounded-full blur-[110px]',
        alive && (drift === 'counter' ? 'bloom-alive-counter' : 'bloom-alive'),
        className,
      )}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, color-mix(in oklab, ${color} 75%, transparent) 0%, transparent 70%)`,
        opacity,
      }}
    />
  )
}
