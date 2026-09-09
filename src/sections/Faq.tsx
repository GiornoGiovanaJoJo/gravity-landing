import { useStore } from '@/lib/store'
import { AccordionItem, Reveal, Section, SectionHeading } from '@/ui/primitives'

export function Faq() {
  const { content } = useStore()
  const { eyebrow, title, subtitle, items } = content.faq
  if (!items.length) return null

  // Разметка для поисковых систем: те же вопросы и ответы, что видит человек.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <Section id="faq">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
        <Reveal delayMs={80} className="border-t border-line">
          {items.map((item) => (
            <AccordionItem key={item.question} question={item.question} answer={item.answer} />
          ))}
        </Reveal>
      </div>
    </Section>
  )
}
