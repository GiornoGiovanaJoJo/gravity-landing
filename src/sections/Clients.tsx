import { useStore } from '@/lib/store'
import { Reveal, Section } from '@/ui/primitives'

/**
 * Логотипы клиентов.
 *
 * Плашки светлые даже в тёмной теме: логотипы присылают в вариантах под белый
 * фон, и на тёмном у половины из них пропадает контур. Подкрашивать чужой знак
 * под свою тему нельзя — это уже не их логотип.
 *
 * Раздел целиком исчезает, пока логотипов нет: пустая строка «Клиенты» хуже,
 * чем её отсутствие.
 */
export function Clients() {
  const { content } = useStore()
  const c = content.clients
  const items = c.items.filter((item) => item.logoUrl)

  if (items.length === 0) return null

  return (
    <Section id="clients" className="border-t border-line">
      <Reveal>
        <p className="eyebrow">{c.eyebrow}</p>
      </Reveal>

      <Reveal delayMs={80}>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <li
              key={item.name}
              className="flex h-24 items-center justify-center rounded-xl border border-line bg-white px-5"
            >
              <img
                src={item.logoUrl}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className="max-h-10 w-full object-contain"
              />
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
