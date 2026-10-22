/**
 * Контракт контента главной страницы.
 *
 * Тот же документ описан zod-схемой на сервере
 * (server/src/modules/landing/schema.ts) — он приходит из
 * GET /api/public/landing и редактируется админом платформы. Всё, что здесь
 * объявлено, обязано иметь дефолт в content.ts: сайт должен полностью
 * работать даже когда CRM недоступна.
 *
 * Страница рассказывает о двух направлениях компании, и разделы названы так,
 * чтобы их нельзя было спутать: «Индивидуальная разработка» — делаем под
 * задачу, «Готовые решения» — берёте и пользуетесь. Прежние «IT-решения для
 * вашего бизнеса» и «Наши продукты» звучали как одно и то же дважды.
 */

export type SectionId =
  | 'hero'
  | 'development'
  | 'quick'
  | 'products'
  | 'clients'
  | 'letters'
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
  /**
   * Промокод, который дописывается к ссылкам на регистрацию.
   *
   * Делает их пригласительными: форма регистрации подставляет код, активация
   * засчитывается партнёру и даёт пробный период — так в CRM видно, что
   * компания пришла с сайта. Пусто — обычная регистрация.
   */
  promoCode: string
}

/** Направление под заставкой: значок и подпись в одну-две строки. */
export interface HeroHighlight {
  /** Имя значка из `ui/Icon`. */
  icon: string
  label: string
}

/**
 * Первый экран — заставка студии во всю ширину.
 *
 * Название и строка о компании нарисованы в самом ролике, поэтому здесь они
 * дублируются текстом: ни поисковик, ни читалка экрана видео не разбирают, а
 * первый экран — единственное место, где сайт называет, чем занимается.
 */
export interface HeroContent {
  title: string
  subtitle: string
  cta: string
  /** Куда ведёт кнопка. Пусто — к форме заявки. */
  href: string
  highlights: HeroHighlight[]
}

/** Направление разработки: нумерованная карточка в сетке. */
export interface DevelopmentItem {
  title: string
  text: string
}

export interface DevelopmentContent {
  eyebrow: string
  title: string
  subtitle: string
  items: DevelopmentItem[]
  /** Две кнопки под сеткой: обсудить разработку и уйти к готовым решениям. */
  primaryCta: string
  secondaryCta: string
}

export interface QuickContent {
  eyebrow: string
  title: string
  text: string
  submitLabel: string
  /** Мессенджеры и соцсети: показывается только заполненное. */
  channels: LinkItem[]
}

/** Готовый продукт в карусели. */
export interface ProductItem {
  name: string
  text: string
  /** Куда ведёт «Подробнее». Пусто — ссылка не рисуется. */
  href: string
  imageUrl: string
  imageUrlDark: string
}

export interface ProductsContent {
  eyebrow: string
  title: string
  subtitle: string
  items: ProductItem[]
  /** Баннер под каруселью: единый вход во все продукты. */
  bannerTitle: string
  bannerText: string
  bannerCta: string
  bannerHref: string
}

export interface ClientItem {
  name: string
  logoUrl: string
}

export interface ClientsContent {
  eyebrow: string
  items: ClientItem[]
}

/** Рекомендательное письмо: превью и ссылка на скан. */
export interface LetterItem {
  title: string
  imageUrl: string
  href: string
}

export interface LettersContent {
  eyebrow: string
  items: LetterItem[]
  /** Кнопка на внешнюю площадку с отзывами. Пусто — не рисуется. */
  reviewsLabel: string
  reviewsUrl: string
}

export interface LeadContent {
  eyebrow: string
  title: string
  subtitle: string
  /** Подписи переключателя «что вас интересует». */
  interestLabel: string
  interests: string[]
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
  /** Последний экран: одно предложение и одна кнопка перед подвалом. */
  nextTitle: string
  nextCta: string
}

export interface SectionState {
  id: SectionId
  visible: boolean
}

export interface LandingContent {
  brand: Brand
  nav: LinkItem[]
  hero: HeroContent
  development: DevelopmentContent
  quick: QuickContent
  products: ProductsContent
  clients: ClientsContent
  letters: LettersContent
  lead: LeadContent
  contacts: Contacts
  footer: FooterContent
  /** Порядок массива = порядок секций на странице. */
  sections: SectionState[]
}
