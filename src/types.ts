/**
 * Контракт контента сайта.
 *
 * Тот же документ описан zod-схемой на сервере
 * (server/src/modules/landing/schema.ts) — он приходит из
 * GET /api/public/landing и редактируется админом платформы. Всё, что здесь
 * объявлено, обязано иметь дефолт в content.ts: сайт должен полностью
 * работать даже когда CRM недоступна.
 *
 * Сайт рассказывает об одном продукте — кабинетах застройщика и брокера, —
 * поэтому и разделы здесь его: аналитика канала, возможности, демо-доступ,
 * экраны интерфейса, внедрение. Прежний набор про студию (услуги, тарифы,
 * отзывы, клиенты) убран: страница, которая рассказывает обо всём сразу, не
 * продаёт ничего конкретного.
 */

export type SectionId =
  | 'hero'
  | 'metrics'
  | 'features'
  | 'demo'
  | 'screens'
  | 'rollout'
  | 'faq'
  | 'lead'

export interface LinkItem {
  label: string
  href: string
}

export interface Brand {
  name: string
  tagline: string
  /** База приложения CRM. Пусто — ссылки относительные (общий домен). */
  appUrl: string
  /** Slug формы из конструктора форм CRM: куда падают заявки с сайта. */
  formSlug: string
}

/** Строка макета интерфейса в первом экране: этап воронки и его вес. */
export interface HeroStage {
  label: string
  /** Доля от ширины полосы, 0–100. Чем шире, тем больше на этапе. */
  width: number
}

export interface HeroContent {
  eyebrow: string
  /** Заголовок разбит на строки: набирается крупно, перенос задаётся вручную. */
  titleLines: string[]
  subtitle: string
  /** Подпись кнопки под полем e-mail. */
  primaryCta: string
  /** Кнопка «получить презентацию» и ссылка на скачивание. */
  deckCta: string
  deckLink: string
  deckUrl: string
  note: string
  /** Пункты бокового меню в макете кабинета. */
  mockNav: string[]
  mockStages: HeroStage[]
  /**
   * Обязательная оговорка под макетом. Цифры в интерфейсе — демонстрационные,
   * и выдавать их за результаты клиента нельзя.
   */
  mockNote: string
}

/** Показатель канала: крупное число с подписью. */
export interface MetricItem {
  value: string
  label: string
}

/** Строка горизонтальной диаграммы. */
export interface BarItem {
  label: string
  value: number
}

export interface MetricsContent {
  eyebrow: string
  title: string
  subtitle: string
  items: MetricItem[]
  funnelTitle: string
  funnel: BarItem[]
  trendTitle: string
  /** Значения ломаной по неделям — рисуются как есть, без нормализации. */
  trend: number[]
  trendLabels: string[]
  agenciesTitle: string
  agencies: BarItem[]
  /**
   * Три пустые рамки под результаты пилота. Пока цифр нет, честнее показать
   * пустое место с подписью, чем придумать число.
   */
  pilotTitle: string
  pilotSlots: string[]
}

export interface FeatureItem {
  title: string
  text: string
}

export interface FeaturesContent {
  eyebrow: string
  title: string
  items: FeatureItem[]
  /** Строка с интеграциями под карточками. */
  integrations: string
}

export interface DemoStep {
  title: string
  text: string
}

export interface DemoContent {
  eyebrow: string
  title: string
  steps: DemoStep[]
  submitLabel: string
}

/** Экран кабинета в карусели. */
export interface ScreenItem {
  title: string
  text: string
  /** Адрес картинки. Пусто — рисуется рамка с подписью. */
  imageUrl: string
}

export interface ScreensContent {
  eyebrow: string
  title: string
  frameLabel: string
  items: ScreenItem[]
}

export interface RolloutStep {
  title: string
  text: string
}

export interface RolloutContent {
  eyebrow: string
  title: string
  steps: RolloutStep[]
  /** Плашка под кейсы или приглашение в пилот. Пусто — блок не рисуется. */
  note: string
  /** Юридические отметки: заявления, которые должны быть правдой. */
  badges: string[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqContent {
  eyebrow: string
  title: string
  subtitle: string
  items: FaqItem[]
}

export interface LeadContent {
  eyebrow: string
  title: string
  text: string
  submitLabel: string
  consent: string
  successTitle: string
  successText: string
  /** Показывается, когда форма не настроена или сервер недоступен. */
  fallbackText: string
}

export interface Contacts {
  phone: string
  email: string
  telegram: string
  whatsapp: string
  address: string
  legalName: string
  inn: string
  privacyUrl: string
  offerUrl: string
}

export interface FooterContent {
  slogan: string
  copyright: string
  links: LinkItem[]
}

export interface SectionState {
  id: SectionId
  visible: boolean
}

export interface LandingContent {
  brand: Brand
  nav: LinkItem[]
  hero: HeroContent
  metrics: MetricsContent
  features: FeaturesContent
  demo: DemoContent
  screens: ScreensContent
  rollout: RolloutContent
  faq: FaqContent
  lead: LeadContent
  contacts: Contacts
  footer: FooterContent
  sections: SectionState[]
}
