import { useStore } from '@/lib/store'
import { Icon } from '@/ui/Icon'
import { Marquee, Reveal, SectionHeading } from '@/ui/primitives'
import type { IndustryItem } from '@/types'

/** Отрасли: две встречные ленты — обзор опыта без длинного перечисления. */
export function Industries() {
  const { content } = useStore()
  const { eyebrow, title, subtitle, items } = content.industries
  const half = Math.ceil(items.length / 2)

  return (
    <section id="industries" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
      </div>

      <Reveal className="mt-14 space-y-3">
        <Marquee durationSec={52}>
          <Row items={items.slice(0, half)} />
        </Marquee>
        <Marquee durationSec={62} reverse>
          <Row items={items.slice(half)} />
        </Marquee>
      </Reveal>
    </section>
  )
}

function Row({ items }: { items: IndustryItem[] }) {
  return (
    <div className="flex gap-3 pr-3">
      {items.map((item) => (
        <div key={item.title} className="surface w-72 shrink-0 rounded-card p-6">
          <span className="hairline flex size-9 items-center justify-center rounded-full text-accent">
            <Icon name={item.icon} className="size-4" />
          </span>
          <h3 className="mt-5 text-base font-medium tracking-tight">{item.title}</h3>
          <p className="mt-2 text-sm text-fg-muted">{item.text}</p>
        </div>
      ))}
    </div>
  )
}
