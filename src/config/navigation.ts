import { ArrowRightLeft, LayoutDashboard, PieChart, Tags, Hash, Target, Wallet } from 'lucide-react';

export const MAIN_NAV_ITEMS = [
  { name: 'Dashboard', dictionaryKey: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Wallets', dictionaryKey: 'wallets', href: '/wallets', icon: Wallet },
  { name: 'Categories', dictionaryKey: 'categories', href: '/categories', icon: Tags },
  { name: 'Tags', dictionaryKey: 'tags', href: '/tags', icon: Hash },
  { name: 'Transactions', dictionaryKey: 'transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Budgets', dictionaryKey: 'budgets', href: '/budgets', icon: Target },
  { name: 'Analytics', dictionaryKey: 'analytics', href: '/analytics', icon: PieChart },
];

export const BOTTOM_NAV_ITEMS = [
  { name: 'Home', dictionaryKey: 'home', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Wallets', dictionaryKey: 'wallets', href: '/wallets', icon: Wallet },
  { name: 'Categories', dictionaryKey: 'categories', href: '/categories', icon: Tags },
  { name: 'Transactions', dictionaryKey: 'transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Budgets', dictionaryKey: 'budgets', href: '/budgets', icon: Target },
];
