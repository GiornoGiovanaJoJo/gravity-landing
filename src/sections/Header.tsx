import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { useScrolled, type ThemeMode } from '@/lib/hooks'
import { BLOG_ROUTE, siteHref } from '@/lib/routes'
import { useStore } from '@/lib/store'
import { Logo } from '@/ui/decor'
import { Button, LinkButton } from '@/ui/primitives'

/**
 * Шапка макета: знак слева, разделы в одной «таблетке» по центру, действие
 * справа.
 *
 * Разделы собраны в общую плашку намеренно — так навигация читается одним
 * объектом и не спорит с крупной кнопкой справа, у которой в макете свой вес.
 */
export function Header({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const { content, appLink, openLead } = useStore()
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
        scrolled ? 'border-b border-line bg-bg/85 backdrop-blur-xl' : 'border-b border-transparent',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 transition-all duration-300 sm:px-8',
          scrolled ? 'h-18' : 'h-22',
        )}
      >
        <a href="#top" className="flex items-center" aria-label={content.brand.name}>
          <Logo name={content.brand.name} />
        </a>

        <nav
          className="hidden items-center rounded-pill border border-line bg-bg-soft/60 px-2 py-1.5 backdrop-blur-sm lg:flex"
          aria-label="Разделы страницы"
        >
          {content.nav.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-pill px-5 py-2.5 text-sm text-fg-muted transition hover:bg-accent-soft hover:text-fg"
            >
              {link.label}
            </a>
          ))}
          {/* Блог стоит отдельно от списка разделов: те — якоря этой страницы и
              приходят из админки, а это отдельные страницы сайта, и пропадать
              вместе с устаревшим списком из CRM они не должны. */}
          <a
            href={siteHref(BLOG_ROUTE)}
            className="rounded-pill px-5 py-2.5 text-sm text-fg-muted transition hover:bg-accent-soft hover:text-fg"
          >
            Блог
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            className="flex size-11 items-center justify-center rounded-full border border-line text-fg-muted transition hover:border-accent hover:text-fg"
          >
            {theme === 'dark' ? <SunGlyph /> : <MoonGlyph />}
          </button>

          <LinkButton href={appLink('/login')} variant="ghost" size="sm" className="hidden sm:inline-flex">
            Войти
          </LinkButton>
          <Button onClick={openLead} className="hidden px-8 sm:inline-flex">
            Связаться
          </Button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={menuOpen}
            className="flex size-11 items-center justify-center rounded-full border border-line lg:hidden"
          >
            {menuOpen ? <CloseGlyph /> : <MenuGlyph />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden">
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
            <a
              href={siteHref(BLOG_ROUTE)}
              className="rounded-xl px-3 py-3 text-sm text-fg-muted transition hover:bg-accent-soft hover:text-fg"
            >
              Блог
            </a>
            <div className="mt-3 grid gap-2">
              <Button
                onClick={() => {
                  setMenuOpen(false)
                  openLead()
                }}
                arrow
              >
                Связаться
              </Button>
              <LinkButton href={appLink('/login')} variant="outline">
                Войти в Gravity RPA
              </LinkButton>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

/* Мелкие глифы рисуем инлайном: тянуть ради них ещё три иконки из пакета незачем. */

function SunGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function MoonGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  )
}

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
