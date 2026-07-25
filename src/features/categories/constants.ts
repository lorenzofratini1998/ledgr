import { Car, Coffee, Gift, Heart, Home, ShoppingCart, Tag, Zap } from 'lucide-react';

export const CATEGORY_COLORS = [
  'slate',
  'blue',
  'emerald',
  'amber',
  'rose',
  'violet',
  'cyan',
  'fuchsia'
] as const;

export type CategoryColor = typeof CATEGORY_COLORS[number];

export const CATEGORY_ICONS = [
  'tag',
  'home',
  'shopping-cart',
  'car',
  'zap',
  'coffee',
  'heart',
  'gift'
] as const;

export type CategoryIcon = typeof CATEGORY_ICONS[number];

export const DEFAULT_CATEGORY_THEMES: Record<string, { color: CategoryColor; icon: CategoryIcon }> = {
  default: {
    color: 'slate',
    icon: 'tag',
  },
};

export const CATEGORY_ICON_MAP: Record<CategoryIcon, React.ElementType> = {
  'tag': Tag,
  'home': Home,
  'shopping-cart': ShoppingCart,
  'car': Car,
  'zap': Zap,
  'coffee': Coffee,
  'heart': Heart,
  'gift': Gift,
};

export const CATEGORY_COLOR_MAP: Record<CategoryColor, { bg: string; text: string; hex: string }> = {
  'slate': { bg: 'bg-slate-500', text: 'text-slate-500', hex: '#64748b' },
  'blue': { bg: 'bg-blue-500', text: 'text-blue-500', hex: '#3b82f6' },
  'emerald': { bg: 'bg-emerald-500', text: 'text-emerald-500', hex: '#10b981' },
  'amber': { bg: 'bg-amber-500', text: 'text-amber-500', hex: '#f59e0b' },
  'rose': { bg: 'bg-rose-500', text: 'text-rose-500', hex: '#f43f5e' },
  'violet': { bg: 'bg-violet-500', text: 'text-violet-500', hex: '#8b5cf6' },
  'cyan': { bg: 'bg-cyan-500', text: 'text-cyan-500', hex: '#06b6d4' },
  'fuchsia': { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500', hex: '#d946ef' },
};
