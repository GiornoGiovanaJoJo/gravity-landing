/**
 * Контракт контента сайта студии.
 *
 * Тот же документ описан zod-схемой на сервере
 * (server/src/modules/landing/schema.ts) — он приходит из
 * GET /api/public/landing и редактируется админом платформы. Всё, что здесь
 * объявлено, обязано иметь дефолт в content.ts: сайт должен полностью
 * работать даже когда CRM недоступна.
 */

export type SectionId =
  | 'hero'
  | 'ticker'
  | 'services'
  | 'about'
  | 'process'
  | 'industries'
  | 'product'
  | 'plans'
  | 'cta'
  | 'reviews'
  | 'clients'
  | 'faq'
  | 'lead'

/** Имя иконки из lucide-react. Резолвится через карту в ui/Icon.tsx. */
export type IconName = string

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

export interface HeroContent {
  eyebrow: string
  /** Заголовок разбит на строки: набирается крупно, перенос задаётся вручную. */
  titleLines: string[]
  subtitle: string
  primaryCta: string
  secondaryCta: string
  note: string
}

export interface ServiceItem {
  icon: IconName
  title: string
  text: string
  /** Крупная карточка занимает две колонки в сетке услуг. */
  wide?: boolean
}

export interface ServicesContent {
  eyebrow: string
  title: string
  subtitle: string
  items: ServiceItem[]
}

export interface AboutMetric {
  value: number
  suffix: string
  label: string
}

export interface AboutContent {
  eyebrow: string
  title: string
  text: string
  /** Строка о команде — здесь же имя основателя, один раз на весь сайт. */
  signature: string
  metrics: AboutMetric[]
}

export interface ProcessStep {
  title: string
  text: string
  /** Ориентировочный срок этапа. */
  duration: string
}

export interface ProcessContent {
  eyebrow: string
  title: string
  subtitle: string
  steps: ProcessStep[]
}

export interface IndustryItem {
  icon: IconName
  title: string
  text: string
}

export interface IndustriesContent {
  eyebrow: string
  title: string
  subtitle: string
  items: IndustryItem[]
}

/** Идентификатор HTML-мокапа, который рисуется во вкладке продукта. */
export type MockKind = 'kanban' | 'automation' | 'call' | 'industry'

export interface ProductTab {
  id: string
  label: string
  icon: IconName
  title: string
  text: string
  bullets: string[]
  mock: MockKind
}

export interface ProductContent {
  eyebrow: string
  title: string
  subtitle: string
  primaryCta: string
  secondaryCta: string
  tabs: ProductTab[]
}

export interface PlanItem {
  name: string
  description: string
  price: string
  features: string[]
  highlighted: boolean
  cta: string
}

export interface PlansContent {
  eyebrow: string
  title: string
  subtitle: string
  note: string
  items: PlanItem[]
}

export interface CtaContent {
  title: string
  text: string
  primaryCta: string
  secondaryCta: string
}

export interface ReviewItem {
  author: string
  role: string
  company: string
  text: string
  logoUrl: string
}

export interface ReviewsContent {
  eyebrow: string
  title: string
  subtitle: string
  items: ReviewItem[]
}

export interface ClientItem {
  name: string
  logoUrl: string
}

export interface ClientsContent {
  eyebrow: string
  title: string
  subtitle: string
  items: ClientItem[]
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
  ticker: string[]
  services: ServicesContent
  about: AboutContent
  process: ProcessContent
  industries: IndustriesContent
  product: ProductContent
  plans: PlansContent
  cta: CtaContent
  reviews: ReviewsContent
  clients: ClientsContent
  faq: FaqContent
  lead: LeadContent
  contacts: Contacts
  footer: FooterContent
  /** Порядок массива = порядок секций на странице. */
  sections: SectionState[]
}
