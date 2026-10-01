/**
 * Контракт контента страницы про кабинеты застройщика и брокера.
 *
 * Отдельная страница под отдельный продукт, поэтому и контракт свой. Главная
 * рассказывает про студию и правится в админке платформы; эта рассказывает про
 * один продукт, и её тексты меняются вместе с ним — то есть в сборке.
 *
 * Разделы идут от задачи покупателя, а не от списка функций: что происходит с
 * каналом продаж в цифрах, чем управляешь, как попробовать, как внедряется.
 */

export type BrokerSectionId =
  | 'hero'
  | 'metrics'
  | 'features'
  | 'demo'
  | 'screens'
  | 'rollout'
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
  /**
   * Ряд «Результаты внедрения» — заглушка под цифры пилота. Пока цифр нет, он
   * скрыт: пустые рамки на витрине читаются как недоделанная страница.
   */
  pilotVisible: boolean
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
  /** Адрес снимка для светлой темы. Пусто — рисуется рамка с подписью. */
  imageUrl: string
  /**
   * Снимок того же экрана в тёмной теме. Кабинет умеет обе, и показывать
   * светлый интерфейс на тёмной странице значит выдавать чужую картинку за
   * свою. Пусто — показывается светлый.
   */
  imageUrlDark: string
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

export interface LeadContent {
  eyebrow: string
  title: string
  text: string
  submitLabel: string
  successTitle: string
  successText: string
  /** Приписка под финальной формой: срок, отсутствие карты, тестовые данные. */
  note: string
  /** Показывается, когда форма не настроена или сервер недоступен. */
  fallbackText: string
}

/** Документы и реквизиты: показывается только то, что заполнено. */
export interface Legal {
  legalName: string
  inn: string
  ogrn: string
  address: string
  privacyUrl: string
  consentUrl: string
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
  id: BrokerSectionId
  visible: boolean
}

export interface BrokerLandingContent {
  brand: Brand
  nav: LinkItem[]
  hero: HeroContent
  metrics: MetricsContent
  features: FeaturesContent
  demo: DemoContent
  screens: ScreensContent
  rollout: RolloutContent
  lead: LeadContent
  contacts: Contacts
  legal: Legal
  footer: FooterContent
  sections: SectionState[]
}
