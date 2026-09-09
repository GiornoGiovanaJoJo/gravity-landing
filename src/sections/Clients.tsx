import { useStore } from '@/lib/store'
import { Marquee, Reveal, SectionHeading } from '@/ui/primitives'
import type { ClientItem } from '@/types'

/** Логотипы клиентов. Пока логотип не загружен — показываем название. */
export function Clients() {
  const { content } = useStore()
  const { eyebrow, title, subtitle, items } = content.clients
  if (!items.length) return null

  const half = Math.ceil(items.length / 2)

  return (
    <section id="clients" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </div>

      <Reveal className="mt-12 space-y-3">
        <Marquee durationSec={64}>
          <Row items={items.slice(0, half)} />
        </Marquee>
        <Marquee durationSec={72} reverse>
          <Row items={items.slice(half)} />
        </Marquee>
      </Reveal>
    </section>
  )
}

function Row({ items }: { items: ClientItem[] }) {
  return (
    <div className="flex items-center gap-3 pr-3">
      {items.map((client, i) => (
        <div
          key={`${client.name}-${i}`}
          className="surface flex h-24 w-48 shrink-0 items-center justify-center rounded-card px-6"
        >
          {client.logoUrl ? (
            <img
              src={client.logoUrl}
              alt={client.name}
              loading="lazy"
              className="max-h-10 w-auto opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0"
            />
          ) : (
            <span className="text-center text-xs text-fg-subtle">{client.name}</span>
          )}
        </div>
      ))}
    </div>
  )
}
