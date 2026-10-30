import { useStore } from '@/lib/store'
import { Button, Card, SHELL } from '@/ui/primitives'
import { BlogPanel } from './BlogPanel'

/**
 * /admin — точка входа в управление сайтом.
 *
 * Доступен и на корне домена, и во встроенной в CRM сборке (`.../site/admin`)
 * — тот же механизм маршрутизации, что у /broker (см. lib/routes.ts).
 *
 * «Тексты и материалы» — просто ссылка в уже готовый редактор Gravity RPA
 * (раздел «Титульный сайт» в /superadmin): дублировать его здесь незачем.
 * Блог же нигде больше не редактируется, поэтому у него свой, настоящий
 * редактор прямо на этой странице.
 */
export function AdminPage() {
  const { appLink } = useStore()

  return (
    <div className="min-h-screen bg-bg text-fg">
      <div className={SHELL}>
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line py-10">
          <div>
            <p className="eyebrow">Админка</p>
            <h1 className="display-sm mt-5">Сайт и блог</h1>
          </div>
        </header>

        <div className="grid gap-6 py-10 lg:grid-cols-[22rem_1fr] lg:items-start">
          <Card className="p-6">
            <h2 className="text-lg">Тексты и материалы</h2>
            <p className="mt-2 text-sm text-fg-muted text-pretty">
              Заголовки, подписи, контакты и секции главной — редактируются в Gravity RPA, в разделе «Титульный
              сайт».
            </p>
            <Button
              className="mt-5 w-full"
              onClick={() => window.open(appLink('/superadmin?view=landing'), '_blank', 'noopener')}
            >
              Открыть в Gravity RPA
            </Button>
          </Card>

          <BlogPanel />
        </div>
      </div>
    </div>
  )
}
