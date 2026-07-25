import { Suspense } from 'react';
import { getWallets } from '@/features/wallets/queries';
import { getUser } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { getTranslator } from '@/i18n/server';
import { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { formatCurrency } from '@/lib/formatters';
import { WALLET_COLOR_MAP, WALLET_ICON_MAP } from '@/features/wallets/constants';
import { Wallet as DefaultWalletIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PeriodSelector } from '@/features/dashboard/components/period-selector';
import { BalanceTrendWidget, BalanceTrendWidgetSkeleton } from '@/features/dashboard/components/widgets/balance-trend-widget';
import { CategoryBreakdownWidget, CategoryBreakdownWidgetSkeleton } from '@/features/dashboard/components/widgets/category-breakdown-widget';
import { IncomeVsExpensesWidget, IncomeVsExpensesWidgetSkeleton } from '@/features/dashboard/components/widgets/income-vs-expenses-widget';
import { RecentTransactionsWidget, RecentTransactionsWidgetSkeleton } from '@/features/dashboard/components/widgets/recent-transactions-widget';
import { parsePeriod } from '@/features/dashboard/utils';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const { data: { user } } = await getUser();
  if (!user) return { title: 'Wallet Not Found' };
  
  const wallets = await getWallets(user.id);
  const wallet = wallets.find(w => w.id === id);
  if (!wallet) return { title: 'Wallet Not Found' };

  return {
    title: `${wallet.name} - Ledgr`,
  };
}

export default async function WalletDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const { id: walletId } = await params;
  const resolvedSearchParams = await searchParams;
  const { t } = await getTranslator();
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/login');
  }

  const wallets = await getWallets(user.id);
  const wallet = wallets.find(w => w.id === walletId);

  if (!wallet) {
    notFound();
  }

  const period = resolvedSearchParams?.period;
  const { from, to, resolvedPeriod } = await parsePeriod(period, resolvedSearchParams?.from, resolvedSearchParams?.to);

  const Icon = wallet.icon && WALLET_ICON_MAP[wallet.icon as keyof typeof WALLET_ICON_MAP]
    ? WALLET_ICON_MAP[wallet.icon as keyof typeof WALLET_ICON_MAP]
    : DefaultWalletIcon;

  const colorClass = wallet.color && WALLET_COLOR_MAP[wallet.color as keyof typeof WALLET_COLOR_MAP]
    ? WALLET_COLOR_MAP[wallet.color as keyof typeof WALLET_COLOR_MAP].cardStyle
    : 'bg-primary/10 text-primary';

  return (
    <div className="flex flex-col h-full space-y-6 pt-safe pb-safe pb-24 md:pb-6 px-4 md:px-8">
      {/* Back Button & Header */}
      <div className="mt-4 flex items-center space-x-4">
        <Link href="/wallets" className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'rounded-full' })}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div className={cn("p-2.5 rounded-xl", colorClass)}>
             <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{wallet.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{wallet.type}</p>
          </div>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="flex items-end justify-between">
         <div>
            <p className="text-sm text-muted-foreground mb-1">Balance</p>
            <div className="text-3xl font-bold tracking-tight">
               {formatCurrency(Number(wallet.balance ?? wallet.initial_balance), wallet.currency_code)}
            </div>
         </div>
         <PeriodSelector defaultPeriod={resolvedPeriod} defaultFrom={from} defaultTo={to} />
      </div>

      {/* Widgets Grid */}
      <div className="space-y-6">
        {/* Trend & Breakdown Row */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
          <Suspense fallback={<BalanceTrendWidgetSkeleton />} key={`trend-${walletId}-${from}-${to}`}>
             <BalanceTrendWidget from={from} to={to} walletId={walletId} />
          </Suspense>
          <Suspense fallback={<CategoryBreakdownWidgetSkeleton />} key={`breakdown-${walletId}-${from}-${to}`}>
             <CategoryBreakdownWidget from={from} to={to} walletId={walletId} />
          </Suspense>
        </div>

        {/* Income vs Expenses Row */}
        <div className="grid gap-6 grid-cols-1">
          <Suspense fallback={<IncomeVsExpensesWidgetSkeleton className="col-span-full" />} key={`income-${walletId}-${from}-${to}`}>
             <IncomeVsExpensesWidget from={from} to={to} walletId={walletId} className="col-span-full" />
          </Suspense>
        </div>

        {/* Recent Transactions Row */}
        <div className="grid gap-6 grid-cols-1">
          <Suspense fallback={<RecentTransactionsWidgetSkeleton />}>
             <RecentTransactionsWidget walletId={walletId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
