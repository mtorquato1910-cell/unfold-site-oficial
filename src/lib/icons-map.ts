import {
  Target,
  TrendingUp,
  Sparkles,
  BarChart3,
  Users,
  Rocket,
  Workflow,
  Zap,
  Calculator,
  ClipboardCheck,
  Award,
  Eye,
  Globe,
  Lightbulb,
  Star,
  Heart,
  ShieldCheck,
  Brain,
  Compass,
  LineChart,
  PieChart,
  MessageSquare,
  Phone,
  Mail,
  Search,
  Settings,
  Wrench,
  Database,
  Cpu,
  Activity,
  Layers,
  GitBranch,
  type LucideIcon,
} from 'lucide-react'

export const ICON_OPTIONS = [
  'Target', 'TrendingUp', 'Sparkles', 'BarChart3', 'Users', 'Rocket', 'Workflow', 'Zap',
  'Calculator', 'ClipboardCheck', 'Award', 'Eye', 'Globe', 'Lightbulb', 'Star', 'Heart',
  'ShieldCheck', 'Brain', 'Compass', 'LineChart', 'PieChart', 'MessageSquare', 'Phone',
  'Mail', 'Search', 'Settings', 'Wrench', 'Database', 'Cpu', 'Activity', 'Layers', 'GitBranch',
] as const

export type IconName = (typeof ICON_OPTIONS)[number]

export const ICONS: Record<IconName, LucideIcon> = {
  Target, TrendingUp, Sparkles, BarChart3, Users, Rocket, Workflow, Zap,
  Calculator, ClipboardCheck, Award, Eye, Globe, Lightbulb, Star, Heart,
  ShieldCheck, Brain, Compass, LineChart, PieChart, MessageSquare, Phone,
  Mail, Search, Settings, Wrench, Database, Cpu, Activity, Layers, GitBranch,
}

export function getIcon(name: string | null | undefined, fallback: IconName = 'Sparkles'): LucideIcon {
  if (name && name in ICONS) return ICONS[name as IconName]
  return ICONS[fallback]
}
