import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  PieChart,
  Target
} from 'lucide-react';

export const MAIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Wallets', href: '/wallets', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Budgets', href: '/budgets', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: PieChart },
];

export const BOTTOM_NAV_ITEMS = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Wallets', href: '/wallets', icon: Wallet },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Budgets', href: '/budgets', icon: Target },
];
