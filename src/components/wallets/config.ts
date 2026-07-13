import { Wallet as WalletIcon, CreditCard, PiggyBank, TrendingUp, Coins, Landmark } from 'lucide-react';
import { WalletColor, WalletIcon as WalletIconType } from '@/lib/constants/wallets';

export const WALLET_ICON_MAP: Record<WalletIconType, React.ElementType> = {
  'wallet': WalletIcon,
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
