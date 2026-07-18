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

export const CATEGORY_COLOR_MAP: Record<CategoryColor, { bg: string; text: string }> = {
  'slate': { bg: 'bg-slate-500', text: 'text-slate-500' },
  'blue': { bg: 'bg-blue-500', text: 'text-blue-500' },
  'emerald': { bg: 'bg-emerald-500', text: 'text-emerald-500' },
  'amber': { bg: 'bg-amber-500', text: 'text-amber-500' },
  'rose': { bg: 'bg-rose-500', text: 'text-rose-500' },
  'violet': { bg: 'bg-violet-500', text: 'text-violet-500' },
  'cyan': { bg: 'bg-cyan-500', text: 'text-cyan-500' },
  'fuchsia': { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500' },
};
