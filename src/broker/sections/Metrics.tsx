import { useBrokerStore } from '../store'
import { Card, Reveal, Section, SectionHeading } from '../ui'
import type { BarItem } from '../types'

/**
 * Аналитика канала.
 *
 * Показывает не список отчётов, а то, ради чего их смотрят: сколько фиксаций
 * дошло до сделки, где канал теряет и кто из агентств приводит клиентов.
 *
 * Все числа здесь демонстрационные, и это написано дважды — в подзаголовке и
 * в первом экране. Цифры на витрине без оговорки читаются как достижения
 * клиента, а такой клиент у нас пока не назван.
 */
export function Metrics() {
  const { content } = useBrokerStore()
  const m = content.metrics

  return (
    <Section id="metrics">
      <SectionHeading eyebrow={m.eyebrow} title={m.title} subtitle={m.subtitle} />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {m.items.map((item, i) => (
          <Reveal key={item.label} delayMs={i * 60}>
            <Card className="h-full p-6">
              <p className="text-[length:var(--b-metric)] leading-none text-accent">{item.value}</p>
              <p className="mt-4 text-sm text-fg-muted text-pretty">{item.label}</p>
            </Card>
          </Reveal>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Reveal>
          <Card className="h-full p-6">
            <ChartTitle>{m.funnelTitle}</ChartTitle>
            <Bars items={m.funnel} tone="accent" />
          </Card>
        </Reveal>

        <Reveal delayMs={80}>
          <Card className="h-full p-6">
            <ChartTitle>{m.trendTitle}</ChartTitle>
            <Trend values={m.trend} labels={m.trendLabels} />
          </Card>
        </Reveal>

        <Reveal delayMs={160}>
          <Card className="h-full p-6">
            <ChartTitle>{m.agenciesTitle}</ChartTitle>
            <Bars items={m.agencies} tone="indigo" />
          </Card>
        </Reveal>
      </div>

      {/* Пустые рамки под цифры пилота. Пустое место с подписью честнее
          придуманного числа и заодно показывает, что именно мы считаем. */}
      {m.pilotSlots.length > 0 && (
        <Reveal className="mt-12">
          <p className="b-caption">{m.pilotTitle}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {m.pilotSlots.map((slot) => (
              <div key={slot} className="rounded-2xl border border-dashed border-line p-5">
                <span className="block h-7 w-12 rounded border-2 border-line" aria-hidden="true" />
                <p className="mt-3 text-sm text-fg-muted text-pretty">{slot}</p>
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </Section>
  )
}

function ChartTitle({ children }: { children: React.ReactNode }) {
  return <p className="b-caption mb-6">{children}</p>
}

/**
 * Горизонтальные полосы.
 *
 * Ширина считается от наибольшего значения, а не от суммы: сравнивают этапы
 * между собой, и доля от общего здесь ничего не сообщает.
 */
function Bars({ items, tone }: { items: BarItem[]; tone: 'accent' | 'indigo' }) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const fill = tone === 'accent' ? 'bg-chart-1' : 'bg-chart-2'

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3 text-sm">
          <span className="w-28 shrink-0 truncate text-fg-muted">{item.label}</span>
          <span className="flex min-w-0 flex-1 items-center gap-2.5">
            <span
              className={`h-6 rounded-md ${fill}`}
              style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}
            />
            <span className="shrink-0 font-semibold tabular-nums">{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

/** Ломаная по неделям. Рисуется в SVG, чтобы не тянуть библиотеку графиков. */
function Trend({ values, labels }: { values: number[]; labels: string[] }) {
  if (values.length < 2) return null

  const w = 300
  const h = 120
  const pad = 10
  // Сверху запас под подпись максимума: без него цифра уезжает за край viewBox
  // и просто не рисуется.
  const padTop = 22
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = Math.max(max - min, 1)

  const points = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1)
    const y = h - pad - ((v - min) / span) * (h - pad - padTop)
    return [x, y] as const
  })
  const path = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const [lastX, lastY] = points[points.length - 1]

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label={`Значения: ${values.join(', ')}`}>
        {/* Две направляющие вместо сетки: график читается по форме, а не по клеткам. */}
        <line x1={pad} y1={h / 2} x2={w - pad} y2={h / 2} className="stroke-line" strokeWidth="1" />
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} className="stroke-line" strokeWidth="1" />
        <path d={path} fill="none" stroke="var(--chart-1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastX} cy={lastY} r="4" fill="var(--chart-1)" />
        {/* Подписаны только края: середина читается по форме линии, а цифры на
            каждой точке превратили бы график в таблицу. */}
        <text x={points[0][0]} y={points[0][1] - 8} className="fill-fg-subtle text-[10px]">
          {values[0]}
        </text>
        <text x={lastX} y={lastY - 10} textAnchor="end" className="fill-fg-subtle text-[10px]">
          {values[values.length - 1]}
        </text>
      </svg>
      <div className="mt-2 flex justify-between text-[11px] text-fg-subtle">
        {labels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </div>
  )
}
