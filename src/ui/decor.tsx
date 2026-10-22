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
