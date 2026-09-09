import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Code2,
  GraduationCap,
  HardHat,
  Import,
  Inbox,
  Layers,
  Mail,
  MessageCircle,
  Package,
  Phone,
  PhoneCall,
  Plug,
  Rocket,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  Ticket,
  TrendingUp,
  Truck,
  Users,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/**
 * Явный список иконок вместо динамического импорта всего пакета: контент
 * приходит с сервера строкой, а в бандл должно попасть только то, что реально
 * используется.
 */
const ICONS: Record<string, LucideIcon> = {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  Clock,
  Code2,
  GraduationCap,
  HardHat,
  Import,
  Inbox,
  Layers,
  Mail,
  MessageCircle,
  Package,
  Phone,
  PhoneCall,
  Plug,
  Rocket,
  Send,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Stethoscope,
  Ticket,
  TrendingUp,
  Truck,
  Users,
  Workflow,
  Wrench,
  Zap,
}

export function Icon({ name, className }: { name: string; className?: string }) {
  const Component = ICONS[name] ?? Sparkles
  return <Component className={className} aria-hidden="true" />
}
