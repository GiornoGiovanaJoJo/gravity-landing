import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Склейка классов с разрешением конфликтов.
 *
 * Собственные ключи темы перечислены здесь не для красоты: tailwind-merge знает
 * только встроенные размеры, а незнакомый класс не считает конфликтующим и
 * оставляет оба. То есть `cn('max-w-shell', 'max-w-3xl')` дал бы ширину,
 * зависящую от порядка правил в собранном CSS, а не от порядка аргументов — и
 * переопределить колонку в отдельном разделе было бы нельзя.
 */
const merge = extendTailwindMerge({
  extend: { theme: { container: ['shell'] } },
})

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs))
}
