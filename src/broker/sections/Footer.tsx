import { useBrokerStore } from '../store'
import { Logo } from '../ui'

/**
 * Подвал страницы продукта.
 *
 * Реквизиты и документы по ПДн обязательны: страница собирает адреса
 * посетителей, и человек должен видеть, кто их обрабатывает и по каким
 * правилам. Всё, что не заполнено, не рисуется — пустая строка «ИНН» хуже её
 * отсутствия, а выдуманная недопустима.
 */
export function Footer() {
  const { content, appLink } = useBrokerStore()
  const { footer, contacts, legal, nav, brand } = content

  const requisites = [
    legal.legalName,
    legal.inn && `ИНН ${legal.inn}`,
    legal.ogrn && `ОГРН ${legal.ogrn}`,
    legal.address,
  ].filter(Boolean)

  const documents = [
    legal.privacyUrl && { label: 'Политика конфиденциальности', href: legal.privacyUrl },
    legal.consentUrl && { label: 'Согласие на обработку данных', href: legal.consentUrl },
  ].filter(Boolean) as { label: string; href: string }[]

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo name={brand.name} />
          <p className="mt-5 max-w-sm text-sm text-fg-muted text-pretty">{footer.slogan}</p>
        </div>

        <nav aria-label="Разделы страницы">
          <h2 className="b-caption">Разделы</h2>
          <ul className="mt-5 space-y-3">
            {nav.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-fg-muted transition hover:text-fg">
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href={appLink('/login')} className="text-sm text-fg-muted transition hover:text-fg">
                Войти в кабинет
              </a>
            </li>
          </ul>
        </nav>

        {/* Пока ни контактов, ни документов нет, колонка не рисуется: пустой
            заголовок читается как недоделанная страница. */}
        <div className={contacts.phone || contacts.email || documents.length ? '' : 'hidden'}>
          <h2 className="b-caption">Контакты и документы</h2>
          <ul className="mt-5 space-y-3 text-sm text-fg-muted">
            {contacts.phone && (
              <li>
                <a href={`tel:${contacts.phone.replace(/[^\d+]/g, '')}`} className="transition hover:text-fg">
                  {contacts.phone}
                </a>
              </li>
            )}
            {contacts.email && (
              <li>
                <a href={`mailto:${contacts.email}`} className="transition hover:text-fg">
                  {contacts.email}
                </a>
              </li>
            )}
            {documents.map((doc) => (
              <li key={doc.href}>
                <a href={doc.href} target="_blank" rel="noreferrer" className="transition hover:text-fg">
                  {doc.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{footer.copyright}</p>
          {requisites.length > 0 && <p className="text-pretty">{requisites.join(' · ')}</p>}
        </div>
      </div>
    </footer>
  )
}
