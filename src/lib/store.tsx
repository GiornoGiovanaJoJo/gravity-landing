import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { defaultContent } from '@/content'
import { fetchLandingContent } from './api'
import type { LandingContent } from '@/types'

interface Store {
  content: LandingContent
  /** Открыть модалку заявки (её вызывают кнопки из разных секций). */
  openLead: () => void
  closeLead: () => void
  leadOpen: boolean
  /** Готовая ссылка в приложение CRM с учётом настроенного домена. */
  appLink: (path: string) => string
}

const StoreContext = createContext<Store | null>(null)

/**
 * Слияние правок из CRM с дефолтами.
 *
 * Поверхностного merge достаточно и он безопаснее глубокого: сервер отдаёт
 * секции целыми объектами, а недостающие ключи должны браться из сборки, чтобы
 * частично заполненный документ не оставил на странице пустые блоки.
 */
function mergeContent(base: LandingContent, patch: Partial<LandingContent> | null): LandingContent {
  if (!patch) return base
  const merged: LandingContent = { ...base }
  for (const key of Object.keys(patch) as (keyof LandingContent)[]) {
    const value = patch[key]
    if (value === undefined || value === null) continue
    if (Array.isArray(value)) {
      if (value.length) (merged[key] as unknown) = value
    } else if (typeof value === 'object') {
      ;(merged[key] as unknown) = { ...(base[key] as object), ...(value as object) }
    } else {
      ;(merged[key] as unknown) = value
    }
  }

  /*
   * Состав страницы пережил смену набора секций.
   *
   * В опубликованном документе может лежать список разделов прежней версии
   * сайта (услуги, тарифы, отзывы). Просто подставить его нельзя: ни одного
   * известного id в нём нет, и страница осталась бы пустой — причём не у нас на
   * сборке, а у посетителя, сразу после первого же ответа API.
   */
  const known = new Set(base.sections.map((s) => s.id))
  const kept = merged.sections.filter((s) => known.has(s.id))
  const missing = base.sections.filter((s) => !kept.some((k) => k.id === s.id))
  merged.sections = kept.length ? [...kept, ...missing] : base.sections

  return merged
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<LandingContent>(defaultContent)
  const [leadOpen, setLeadOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchLandingContent(controller.signal).then((patch) => {
      if (patch) setContent((current) => mergeContent(current, patch))
    })
    return () => controller.abort()
  }, [])

  const appLink = useCallback(
    (path: string) => {
      const base = content.brand.appUrl?.replace(/\/+$/, '') ?? ''
      return `${base}${path}`
    },
    [content.brand.appUrl],
  )

  const value = useMemo<Store>(
    () => ({
      content,
      leadOpen,
      openLead: () => setLeadOpen(true),
      closeLead: () => setLeadOpen(false),
      appLink,
    }),
    [content, leadOpen, appLink],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used within StoreProvider')
  return store
}

/** Видима ли секция — порядок и видимость задаются в админке платформы. */
export function useVisibleSections() {
  const { content } = useStore()
  return content.sections.filter((s) => s.visible)
}
