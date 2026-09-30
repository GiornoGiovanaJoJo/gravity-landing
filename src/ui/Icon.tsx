import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Явный список иконок вместо динамического импорта всего пакета: контент
 * приходит с сервера строкой, а в бандл должно попасть только то, что реально
 * используется.
 */
const ICONS: Record<string, LucideIcon> = {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Phone,
  Send,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? Sparkles
  return <Component className={className} aria-hidden="true" />
}
