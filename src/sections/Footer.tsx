import { useStore } from '@/lib/store'
import { Logo } from '@/ui/decor'

export function Footer() {
  const { content, appLink } = useStore()
  const { footer, contacts, nav, brand } = content

  const legal = [
    contacts.privacyUrl && { label: 'Политика конфиденциальности', href: contacts.privacyUrl },
    contacts.offerUrl && { label: 'Условия использования', href: contacts.offerUrl },
    ...footer.links,
  ].filter(Boolean) as { label: string; href: string }[]

  const hasContacts = Boolean(contacts.phone || contacts.email || contacts.telegram || contacts.address)

  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <Logo name={brand.name} />
          <p className="mt-5 max-w-sm text-sm text-fg-muted text-pretty">{footer.slogan}</p>
        </div>

        <nav aria-label="Разделы сайта">
          <h2 className="eyebrow">Разделы</h2>
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
                Войти в Gravity RPA
              </a>
            </li>
          </ul>
        </nav>

        {/* Пока контакты не заполнены в админке, колонка не рисуется: пустой
            заголовок «Контакты» читается как недоделанный сайт. */}
        <div className={hasContacts ? '' : 'hidden'}>
          <h2 className="eyebrow">Контакты</h2>
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
            {contacts.telegram && (
              <li>
                <a href={contacts.telegram} className="transition hover:text-fg">
                  Telegram
                </a>
              </li>
            )}
            {contacts.address && <li>{contacts.address}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-fg-subtle sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            {footer.copyright}
            {contacts.legalName ? ` · ${contacts.legalName}` : ''}
            {contacts.inn ? ` · ИНН ${contacts.inn}` : ''}
          </p>
          {legal.length > 0 && (
            <ul className="flex flex-wrap gap-x-6 gap-y-1">
              {legal.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="transition hover:text-fg">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  )
}
