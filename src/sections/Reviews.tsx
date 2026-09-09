import { useStore } from '@/lib/store'
import { Card, Reveal, Section, SectionHeading } from '@/ui/primitives'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

/**
 * Отзывы. Секция по умолчанию выключена: показывать выдуманные цитаты как
 * настоящие нельзя. Админ включает её, загрузив реальные.
 */
export function Reviews() {
  const { content } = useStore()
  const { eyebrow, title, subtitle, items } = content.reviews
  if (!items.length) return null

  return (
    <Section id="reviews">
      <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />

      <div className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
        {items.map((review, i) => (
          <Reveal
            key={`${review.company}-${i}`}
            delayMs={i * 70}
            className="w-[80vw] shrink-0 snap-start sm:w-auto"
          >
            <Card className="flex h-full flex-col p-6 sm:p-8">
              <p className="flex-1 leading-relaxed text-fg-muted text-pretty">«{review.text}»</p>
              <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                {review.logoUrl ? (
                  <img src={review.logoUrl} alt="" loading="lazy" className="size-10 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="hairline flex size-10 shrink-0 items-center justify-center rounded-full text-xs text-accent">
                    {initials(review.author) || '—'}
                  </span>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm">{review.author}</p>
                  <p className="truncate text-xs text-fg-subtle">
                    {review.role}
                    {review.company ? `, ${review.company}` : ''}
                  </p>
                </div>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
