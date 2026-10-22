import { useStore } from '@/lib/store'
import { LoopVideo } from '@/ui/LoopVideo'
import { Button, LinkButton } from '@/ui/primitives'
import { Icon } from '@/ui/Icon'

/**
 * Первый экран: заставка студии во всю ширину.
 *
 * Раньше здесь была карусель продуктов. Она ушла вниз, в «Готовые решения»:
 * человек, впервые открывший сайт, сначала должен понять, кто перед ним, а уже
 * потом выбирать продукт. Названия и строка о компании нарисованы прямо в
 * ролике, поэтому поверх ложатся только кнопка и четыре направления.
 *
 * Блок держит ровно пропорцию кадра (16:9), и это не прихоть вёрстки: кнопка с
 * направлениями расставлены долями высоты, чтобы попадать в промежутки
 * композиции. Стоило бы кадру обрезаться по высоте — и они наехали бы на
 * подпись, причём только на части экранов.
 *
 * На телефоне раскладка другая: кадр шириной в экран делает нарисованную в нём
 * подпись нечитаемой, поэтому там ролик идёт картинкой, а текст, кнопка и
 * направления встают под ним обычным столбцом.
 */
export function Hero() {
  const { content, appLink, openLead } = useStore()
  const { title, subtitle, cta, href, highlights } = content.hero

  const action = href ? (
    <LinkButton href={appLink(href)} size="lg" arrow>
      {cta}
    </LinkButton>
  ) : (
    <Button onClick={openLead} size="lg" arrow>
      {cta}
    </Button>
  )

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Единственный заголовок страницы. Скрыт, потому что нарисован в кадре:
          ни поисковик, ни читалка экрана видео не разбирают, а первый экран —
          то место, где сайт называет себя и своё дело. */}
      <h1 className="sr-only">
        {title} — {subtitle}
      </h1>

      {/* Подложка цвета краёв кадра: когда экран шире вписанного ролика, по
          бокам остаётся фон страницы, а он светлее — и первый экран читался
          картинкой в рамке. */}
      <div className="hidden bg-[#070e17] sm:block">
        {/*
          Размер задаётся высотой, а не шириной: кадр обязан помещаться на экран
          целиком. От ширины 16:9 на мониторе 1920×1080 даёт 1080 точек высоты,
          и нижний ряд направлений оказывается уже за краем экрана — ровно на
          самом ходовом разрешении. Поэтому берётся меньшее из «во всю ширину» и
          «во весь экран за вычетом шапки», а ширину считает соотношение сторон.
        */}
        <div className="@container relative mx-auto aspect-video h-[min(56.25vw,calc(100svh-5.5rem))]">
          <LoopVideo name="hero" label={`${title}: ${subtitle}`} className="absolute inset-0 size-full" />

          {/* Доли подобраны по самому ролику, а не по макету: в нём подпись
              заканчивается ниже, и кнопка с макетными 73% ложилась ровно на
              строку «и устранении человеческого фактора». Ориентир — светящаяся
              линия под подписью: кнопка идёт сразу за ней. */}
          <div className="absolute inset-x-0 top-[80.5%] flex -translate-y-1/2 justify-center px-6">{action}</div>

          <ul className="absolute inset-x-0 top-[92%] flex -translate-y-1/2 flex-wrap items-center justify-center px-6">
            {highlights.map((item, index) => (
              <li
                key={item.label}
                className={`flex items-center gap-[1.1cqw] px-[1.8cqw] ${
                  index > 0 ? 'border-l border-mist/15' : ''
                }`}
              >
                <Icon name={item.icon} className="size-[clamp(0.9rem,2.1cqw,1.6rem)] text-electric" />
                <span className="text-[clamp(0.68rem,1.05cqw,0.95rem)] leading-tight text-mist">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-xl px-5 py-12 sm:hidden">
        <LoopVideo name="hero" label={`${title}: ${subtitle}`} className="aspect-video rounded-3xl border border-line" />

        <p className="mt-8 text-center text-[length:var(--text-lead)] leading-relaxed text-fg-muted text-pretty">
          {subtitle}
        </p>

        <div className="mt-8 flex justify-center">{action}</div>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5">
          {highlights.map((item) => (
            <li key={item.label} className="flex items-start gap-2.5">
              <Icon name={item.icon} className="mt-0.5 size-4 shrink-0 text-accent-fill" />
              <span className="text-xs leading-snug text-fg-muted">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
