import { Hash, Star, Flag, Bookmark, Circle, Tag, Sparkles, Zap } from 'lucide-react';

export const TAG_COLORS = [
  'slate',
  'blue',
  'emerald',
  'amber',
  'rose',
  'violet',
  'cyan',
  'fuchsia'
] as const;

export type TagColor = typeof TAG_COLORS[number];

export const TAG_ICONS = [
  'hash',
  'star',
  'flag',
  'bookmark',
  'circle',
  'tag',
  'sparkles',
  'zap'
] as const;

export type TagIcon = typeof TAG_ICONS[number];

export const TAG_ICON_MAP: Record<TagIcon, React.ElementType> = {
  'hash': Hash,
  'star': Star,
  'flag': Flag,
  'bookmark': Bookmark,
  'circle': Circle,
  'tag': Tag,
  'sparkles': Sparkles,
  'zap': Zap,
};

export const TAG_COLOR_MAP: Record<TagColor, { bg: string; text: string }> = {
  'slate': { bg: 'bg-slate-500', text: 'text-slate-500' },
  'blue': { bg: 'bg-blue-500', text: 'text-blue-500' },
  'emerald': { bg: 'bg-emerald-500', text: 'text-emerald-500' },
  'amber': { bg: 'bg-amber-500', text: 'text-amber-500' },
  'rose': { bg: 'bg-rose-500', text: 'text-rose-500' },
  'violet': { bg: 'bg-violet-500', text: 'text-violet-500' },
  'cyan': { bg: 'bg-cyan-500', text: 'text-cyan-500' },
  'fuchsia': { bg: 'bg-fuchsia-500', text: 'text-fuchsia-500' },
};
