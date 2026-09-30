import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useScrolled } from '@/lib/hooks'
import { useBrokerStore } from '../store'
import { LinkButton, Logo } from '../ui'

/**
 * Шапка страницы продукта.
 *
 * До прокрутки она лежит на тёмной панели первого экрана и своего фона не
 * имеет; дальше становится белой. Переключателя темы здесь нет: палитра
 * страницы фиксирована макетом, и кнопка, которая ничего не меняет, хуже её
 * отсутствия.
 */
export function Header() {
  const { content, appLink } = useBrokerStore()
  const scrolled = useScrolled(12)
  const [menuOpen, setMenuOpen] = useState(false)

  // Открытое меню занимает весь экран — фоновая страница под ним скроллиться
  // не должна.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-line bg-bg/92 backdrop-blur-xl' : 'b-panel border-b border-transparent',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 transition-all duration-300 sm:px-8',
          scrolled ? 'h-16' : 'h-20',
        )}
      >
        <a href="#top" className="flex items-center gap-3" aria-label={content.brand.name}>
          <Logo name={content.brand.name} />
          {content.brand.tagline && (
            <span className="b-caption hidden border-l border-line pl-3 text-accent md:inline">
              {content.brand.tagline}
            </span>
          )}
        </a>

        <nav className="hidden items-center gap-9 lg:flex" aria-label="Разделы страницы">
          {content.nav.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-fg-muted transition hover:text-fg">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LinkButton href={appLink('/login')} variant="ghost" size="sm" className="hidden sm:inline-flex">
            Войти
          </LinkButton>
          <LinkButton href="#demo" size="sm" className="hidden sm:inline-flex">
            {content.hero.primaryCta}
          </LinkButton>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            className="hairline flex size-10 items-center justify-center rounded-full lg:hidden"
          >
            {menuOpen ? <CloseGlyph /> : <MenuGlyph />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-bg/97 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-5 sm:px-8" aria-label="Разделы страницы">
            {content.nav.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm text-fg-muted transition hover:bg-accent-soft hover:text-fg"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-3 grid gap-2">
              <LinkButton href="#demo" onClick={() => setMenuOpen(false)}>
                {content.hero.primaryCta}
              </LinkButton>
              <LinkButton href={appLink('/login')} variant="outline">
                Войти
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

/* Мелкие глифы рисуем инлайном: тянуть ради них ещё две иконки из пакета незачем. */

function MenuGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M4 8h16M4 16h16" />
    </svg>
  )
}

function CloseGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}
