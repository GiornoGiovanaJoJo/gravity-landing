import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useBrokerStore } from '../store'
import { track } from '../tracking'
import { Button } from '../ui'
import { DemoForm } from './DemoForm'

/**
 * Два пути к презентации.
 *
 * «Получить на почту» — основной: контакт остаётся у нас, и по нему можно
 * продолжить разговор. «Скачать» — вторичный, текстовой ссылкой: человек,
 * который не готов оставлять адрес, всё равно должен получить материал, иначе
 * он просто уйдёт.
 *
 * После скачивания показывается плашка с предложением демо-доступа. Она
 * появляется после клика и не блокирует загрузку файла: перехватывать ссылку
 * формой значит менять обещание уже после того, как на него согласились.
 */
export function DeckActions({ className }: { className?: string }) {
  const { content } = useBrokerStore()
  const hero = content.hero
  const [emailOpen, setEmailOpen] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  return (
    <div className={className}>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button variant="outline" onClick={() => setEmailOpen((v) => !v)} aria-expanded={emailOpen}>
          {hero.deckCta}
        </Button>

        {/* Ссылки на файл может не быть, пока презентацию не загрузили —
            мёртвая кнопка «Скачать» хуже её отсутствия. */}
        {hero.deckUrl && (
          <a
            href={hero.deckUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => {
              track('deck_download')
              setDownloaded(true)
            }}
            className="text-sm text-fg-muted underline underline-offset-4 transition hover:text-fg"
          >
            {hero.deckLink}
          </a>
        )}
      </div>

      {emailOpen && (
        <DemoForm
          className="mt-4 max-w-xl"
          submitLabel="Отправить на почту"
          source="Презентация на почту (первый экран)"
          goal="deck_email_submit"
          note="Пришлём презентацию письмом. Ответим на вопросы, если они появятся."
          compact
        />
      )}

      {downloaded && !emailOpen && (
        <div className="mt-4 max-w-xl rounded-2xl border border-accent/40 bg-accent-soft/40 p-4">
          <p className="text-sm font-medium">Хотите попробовать сами?</p>
          <p className={cn('mt-1 text-sm text-fg-muted text-pretty')}>
            Демо-доступ выдаётся по e-mail, 14 дней с первого входа.
          </p>
          <DemoForm
            className="mt-3"
            submitLabel="Получить демо-доступ"
            source="Демо-доступ с сайта (после скачивания презентации)"
            compact
          />
        </div>
      )}
    </div>
  )
}
