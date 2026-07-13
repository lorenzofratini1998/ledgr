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
