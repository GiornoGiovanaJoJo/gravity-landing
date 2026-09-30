import { useStore } from '@/lib/store'
import { Bloom, GridLines } from '@/ui/decor'
import { GlassSlab } from '@/ui/iridescent'
import { Button, LinkButton, Reveal } from '@/ui/primitives'

/** Баннер перед подвалом: последний спокойный призыв обсудить задачу. */
export function Cta() {
  const { content, appLink, openLead } = useStore()
  const cta = content.cta

  return (
    <section className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8">
      <Reveal>
        <div className="surface relative isolate overflow-hidden rounded-card px-6 py-20 sm:px-14 sm:py-28">
          <GridLines className="opacity-60" />
          <Bloom className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" size={620} opacity={0.14} />
          <GlassSlab className="-right-10 -bottom-16 hidden sm:block" size={260} seed={200} parallax={14} />

          <div className="relative max-w-2xl">
            <h2 className="text-[length:var(--text-h2)] leading-[1.05] font-light tracking-tight text-balance uppercase">
              {cta.title}
            </h2>
            <p className="mt-5 max-w-xl text-fg-muted text-pretty">{cta.text}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button onClick={openLead} size="lg" arrow>
                {cta.primaryCta}
              </Button>
              <LinkButton href={appLink('/register')} variant="outline" size="lg">
                {cta.secondaryCta}
              </LinkButton>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
