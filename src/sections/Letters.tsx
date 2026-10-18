import { useStore } from '@/lib/store'
import { Icon } from '@/ui/Icon'
import { Reveal, Section } from '@/ui/primitives'

/**
 * Рекомендательные письма.
 *
 * Сканы на бумаге, поэтому превью светлые в любой теме — это фотография
 * документа, а не элемент интерфейса. Каждое открывается целиком: витрина из
 * нечитаемых миниатюр доверия не прибавляет, а проверить подпись и бланк
 * человек захочет.
 *
 * Лента с прокруткой по той же причине, что и у продуктов: писем со временем
 * станет больше, чем помещается в ряд.
 */
export function Letters() {
  const { content } = useStore()
  const l = content.letters
  const items = l.items.filter((item) => item.imageUrl || item.href)

  if (items.length === 0) return null

  return (
    <Section id="letters" className="border-t border-line">
      <Reveal>
        <p className="eyebrow">{l.eyebrow}</p>
      </Reveal>

      <Reveal delayMs={80} className="mt-10">
        <ul className="no-scrollbar -mx-5 flex snap-x gap-4 overflow-x-auto px-5 pb-2 sm:-mx-8 sm:px-8">
          {items.map((item) => (
            <li key={item.title} className="w-[min(14rem,60vw)] shrink-0 snap-start">
              <a
                href={item.href || item.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="group block overflow-hidden rounded-2xl border border-line bg-white transition hover:border-line-strong"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="block aspect-[3/4] w-full object-cover object-top"
                  />
                ) : (
                  <span className="mono-label flex aspect-[3/4] items-center justify-center px-4 text-center text-iris">
                    {item.title}
                  </span>
                )}
                <span className="flex items-center justify-between gap-2 px-4 py-3 text-xs text-iris">
                  <span className="truncate">{item.title}</span>
                  <Icon name="ArrowUpRight" className="size-3.5 shrink-0 transition-transform group-hover:-translate-y-0.5" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </Reveal>

      {l.reviewsLabel && l.reviewsUrl && (
        <Reveal delayMs={140}>
          <div className="mt-10 flex justify-center">
            <a
              href={l.reviewsUrl}
              target="_blank"
              rel="noreferrer"
              className="hairline inline-flex items-center gap-2 rounded-pill px-6 py-3 text-sm text-fg-muted transition hover:border-line-strong hover:text-fg"
            >
              {l.reviewsLabel}
              <Icon name="ArrowUpRight" className="size-3.5" />
            </a>
          </div>
        </Reveal>
      )}
    </Section>
  )
}
