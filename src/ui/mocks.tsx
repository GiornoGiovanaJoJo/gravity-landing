import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Icon } from './Icon'
import type { MockKind } from '@/types'

/**
 * «Скриншоты» продукта собраны из разметки, а не из картинок: они весят
 * килобайты вместо мегабайт, читаются скринридером, живут в обеих темах и не
 * устаревают вместе со следующим релизом интерфейса.
 */

function BrowserFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="surface overflow-hidden rounded-card">
      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-fg-subtle/30" />
        <span className="size-2.5 rounded-full bg-fg-subtle/30" />
        <span className="size-2.5 rounded-full bg-fg-subtle/30" />
        <span className="ml-2 truncate text-[11px] text-fg-subtle">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function Chip({ children, tone = 'muted' }: { children: ReactNode; tone?: 'muted' | 'accent' | 'ok' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-pill px-2 py-0.5 text-[11px] font-medium',
        tone === 'accent' && 'bg-accent-soft text-accent',
        tone === 'ok' && 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        tone === 'muted' && 'bg-fg-subtle/12 text-fg-muted',
      )}
    >
      {children}
    </span>
  )
}

const KANBAN = [
  {
    title: 'Новые',
    tone: 'muted' as const,
    cards: [
      { name: 'ООО «Северный дом»', sum: '480 000 ₽', tag: 'Сайт' },
      { name: 'Ирина, розница', sum: '96 000 ₽', tag: 'Звонок' },
    ],
  },
  {
    title: 'В работе',
    tone: 'accent' as const,
    cards: [
      { name: 'Компания «Ветер»', sum: '1 250 000 ₽', tag: 'Демо' },
      { name: 'ИП Кузнецов', sum: '210 000 ₽', tag: 'Счёт' },
    ],
  },
  {
    title: 'Согласование',
    tone: 'ok' as const,
    cards: [{ name: 'Группа «Тонус»', sum: '640 000 ₽', tag: 'Договор' }],
  },
]

function KanbanMock() {
  return (
    <BrowserFrame title="Воронка продаж — Gravity RPA">
      <div className="grid grid-cols-3 gap-3">
        {KANBAN.map((column) => (
          <div key={column.title} className="rounded-xl bg-bg-soft/70 p-2.5">
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[11px] font-medium text-fg-muted">{column.title}</span>
              <Chip tone={column.tone}>{column.cards.length}</Chip>
            </div>
            <div className="space-y-2">
              {column.cards.map((card) => (
                <div key={card.name} className="rounded-lg border border-line bg-bg-elevated p-2.5">
                  <p className="truncate text-[11px] font-medium">{card.name}</p>
                  <p className="mt-1 text-[11px] text-fg-subtle">{card.sum}</p>
                  <div className="mt-2">
                    <Chip>{card.tag}</Chip>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </BrowserFrame>
  )
}

const FLOW = [
  { icon: 'Inbox', label: 'Заявка с сайта', note: 'Событие' },
  { icon: 'Users', label: 'Назначить ответственного', note: 'Действие' },
  { icon: 'Clock', label: 'Нет ответа 2 часа', note: 'Условие' },
  { icon: 'Mail', label: 'Письмо и задача', note: 'Действие' },
]

function AutomationMock() {
  return (
    <BrowserFrame title="Сценарий «Обработка заявки» — Gravity RPA">
      <div className="space-y-2.5">
        {FLOW.map((step, i) => (
          <div key={step.label} className="relative">
            <div className="flex items-center gap-3 rounded-xl border border-line bg-bg-soft/70 p-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon name={step.icon} className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium">{step.label}</p>
                <p className="text-[11px] text-fg-subtle">{step.note}</p>
              </div>
              {i === FLOW.length - 1 && (
                <span className="ml-auto">
                  <Chip tone="ok">Активен</Chip>
                </span>
              )}
            </div>
            {i < FLOW.length - 1 && (
              <svg className="mx-auto h-3 w-4" viewBox="0 0 16 12" aria-hidden="true">
                <path
                  d="M8 0 V12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                  className="animate-dash text-accent"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </BrowserFrame>
  )
}

function CallMock() {
  return (
    <BrowserFrame title="Звонок · Компания «Ветер» — Gravity RPA">
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-bg-soft/70 p-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Icon name="PhoneCall" className="size-4" />
          </span>
          <div>
            <p className="text-[11px] font-medium">Входящий · 08:42</p>
            <p className="text-[11px] text-fg-subtle">Менеджер: Анна · Запись сохранена</p>
          </div>
          <span className="ml-auto">
            <Chip tone="ok">Расшифрован</Chip>
          </span>
        </div>

        {/* Дорожка звука: статичная «осциллограмма» из столбиков фиксированной высоты. */}
        <div className="flex h-10 items-end gap-[3px] rounded-xl border border-line bg-bg-soft/70 px-3 py-2">
          {[38, 62, 30, 74, 46, 88, 54, 40, 70, 34, 58, 92, 44, 66, 28, 76, 50, 36, 60, 42].map((h, i) => (
            <span key={i} className="w-full rounded-sm bg-accent/45" style={{ height: `${h}%` }} />
          ))}
        </div>

        <div className="rounded-xl border border-line bg-bg-soft/70 p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-accent">
            <Icon name="Sparkles" className="size-3" />
            Резюме разговора
          </p>
          <p className="text-[11px] leading-relaxed text-fg-muted">
            Клиенту нужен переезд с таблиц до конца квартала. Ждёт расчёт на 25 сотрудников и демо
            склада. Следующий шаг — встреча в четверг.
          </p>
          <div className="mt-2.5 flex gap-1.5">
            <Chip tone="accent">Задача создана</Chip>
            <Chip>Этап: Демо</Chip>
          </div>
        </div>
      </div>
    </BrowserFrame>
  )
}

const FLOORS = [
  ['sold', 'free', 'free', 'booked', 'free', 'sold'],
  ['free', 'booked', 'sold', 'free', 'free', 'free'],
  ['sold', 'free', 'free', 'free', 'booked', 'free'],
  ['free', 'free', 'booked', 'sold', 'free', 'free'],
]

const CELL_TONE: Record<string, string> = {
  free: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
  booked: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
  sold: 'bg-fg-subtle/15 text-fg-subtle',
}

function IndustryMock() {
  return (
    <BrowserFrame title="Шахматка · ЖК «Северный» — Кабинет брокера">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="ok">Свободно 14</Chip>
          <Chip tone="accent">Бронь 4</Chip>
          <Chip>Продано 6</Chip>
        </div>
        <div className="space-y-1.5">
          {FLOORS.map((row, floor) => (
            <div key={floor} className="flex items-center gap-1.5">
              <span className="w-8 shrink-0 text-[11px] text-fg-subtle">{12 - floor} эт.</span>
              <div className="grid flex-1 grid-cols-6 gap-1.5">
                {row.map((state, i) => (
                  <span
                    key={i}
                    className={cn(
                      'flex h-7 items-center justify-center rounded-md text-[11px] font-medium',
                      CELL_TONE[state],
                    )}
                  >
                    {(12 - floor) * 10 + i + 1}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-xl border border-line bg-bg-soft/70 p-2.5">
          <div>
            <p className="text-[11px] font-medium">Комиссия по броням</p>
            <p className="text-[11px] text-fg-subtle">Выплата 15 числа</p>
          </div>
          <p className="text-[13px] font-semibold text-accent">318 400 ₽</p>
        </div>
      </div>
    </BrowserFrame>
  )
}

export function ProductMock({ kind }: { kind: MockKind }) {
  switch (kind) {
    case 'kanban':
      return <KanbanMock />
    case 'automation':
      return <AutomationMock />
    case 'call':
      return <CallMock />
    case 'industry':
      return <IndustryMock />
  }
}
