import { Wallet as WalletIconLucide, CreditCard, PiggyBank, TrendingUp, Coins, Landmark } from 'lucide-react';

export const WALLET_COLORS = [
  'slate',
  'blue',
  'emerald',
  'amber',
  'rose',
  'violet',
] as const;

export type WalletColor = typeof WALLET_COLORS[number];

export const WALLET_ICONS = [
  'wallet',
  'credit-card',
  'piggy-bank',
  'trending-up',
  'coins',
  'landmark',
] as const;

export type WalletIcon = typeof WALLET_ICONS[number];

export const DEFAULT_WALLET_THEMES: Record<string, { color: WalletColor; icon: WalletIcon }> = {
  regular: {
    color: 'slate',
    icon: 'credit-card',
  },
  savings: {
    color: 'emerald',
    icon: 'piggy-bank',
  },
  investment: {
    color: 'violet',
    icon: 'trending-up',
  },
};

export const WALLET_ICON_MAP: Record<WalletIcon, React.ElementType> = {
  'wallet': WalletIconLucide,
  'credit-card': CreditCard,
  'piggy-bank': PiggyBank,
  'trending-up': TrendingUp,
  'coins': Coins,
  'landmark': Landmark,
};

export const WALLET_COLOR_MAP: Record<WalletColor, { bg: string; cardStyle: string }> = {
  'slate': { bg: 'bg-slate-500', cardStyle: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  'blue': { bg: 'bg-blue-500', cardStyle: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  'emerald': { bg: 'bg-emerald-500', cardStyle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  'amber': { bg: 'bg-amber-500', cardStyle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  'rose': { bg: 'bg-rose-500', cardStyle: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  'violet': { bg: 'bg-violet-500', cardStyle: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
};
