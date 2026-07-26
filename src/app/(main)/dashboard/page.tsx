import { Suspense } from 'react';
import { PeriodSelector } from '@/features/dashboard/components/period-selector';
import { DashboardRealtimeSubscriber } from '@/features/dashboard/components/dashboard-realtime-subscriber';
import { NetWorthWidget, NetWorthWidgetSkeleton } from '@/features/dashboard/components/widgets/net-worth-widget';
import { CashflowWidget, CashflowWidgetSkeleton } from '@/features/dashboard/components/widgets/cashflow-widget';
import { BalanceTrendWidget, BalanceTrendWidgetSkeleton } from '@/features/dashboard/components/widgets/balance-trend-widget';
import { CategoryBreakdownWidget, CategoryBreakdownWidgetSkeleton } from '@/features/dashboard/components/widgets/category-breakdown-widget';
import { IncomeVsExpensesWidget, IncomeVsExpensesWidgetSkeleton } from '@/features/dashboard/components/widgets/income-vs-expenses-widget';
import { WalletBalancesWidget, WalletBalancesWidgetSkeleton } from '@/features/dashboard/components/widgets/wallet-balances-widget';
import { RecentTransactionsWidget, RecentTransactionsWidgetSkeleton } from '@/features/dashboard/components/widgets/recent-transactions-widget';
import { flattenCategoriesForSelect, getDisplayName, parsePeriod } from '@/features/dashboard/utils';
import { getUser, createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getWallets } from '@/features/wallets/queries';
import { getCategories } from '@/features/categories/queries';
import { getActiveCurrencies } from '@/lib/constants/currencies';
import { getPrimaryCurrencyCode } from '@/features/transactions/queries';
import { getTags } from '@/features/tags/queries';
import { CreateTransactionTrigger } from '@/features/transactions/components/create-transaction-trigger';
import { getTranslator } from '@/i18n/server';
import { getUserPreferences } from '@/features/preferences/queries';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>;
}) {
  const { data: { user } } = await getUser();
  if (!user) {
    redirect('/login');
  }

  const prefs = await getUserPreferences(user.id);
  const defaultFallback = prefs?.default_dashboard_range || '30d';

  const resolvedParams = await searchParams;
  const period = resolvedParams?.period;
  const { from, to, resolvedPeriod } = await parsePeriod(period, resolvedParams?.from, resolvedParams?.to, defaultFallback);

  const dateFormatPreference = prefs?.date_format || 'DD/MM/YYYY';
  const languageLocale = prefs?.language_locale || 'en-US';

  const supabase = await createClient();

  const [
    wallets,
    nestedCategories,
    currencies,
    primaryCurrencyCode,
    tags
  ] = await Promise.all([
    getWallets(user.id),
    getCategories(user.id),
    getActiveCurrencies(),
    getPrimaryCurrencyCode(supabase, user.id),
    getTags(user.id, { pageSize: 1000 })
  ]);

  const userName = getDisplayName(user);
  const categories = flattenCategoriesForSelect(nestedCategories);
  const { t } = await getTranslator();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <DashboardRealtimeSubscriber userId={user.id} />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.hello', { name: userName })}</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <PeriodSelector defaultPeriod={resolvedPeriod} defaultFrom={from} defaultTo={to} dateFormatPreference={dateFormatPreference} />
          <CreateTransactionTrigger
            wallets={wallets as any}
            categories={categories}
            currencies={currencies as any}
            tags={tags.data as any}
            defaultCurrency={primaryCurrencyCode || 'USD'}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* KPI Row */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          <div className="md:col-span-1">
            <Suspense fallback={<NetWorthWidgetSkeleton />} key={`networth-${from}-${to}`}>
              <NetWorthWidget from={from} to={to} currencyCode={primaryCurrencyCode || 'USD'} locale={languageLocale} />
            </Suspense>
          </div>
          <div className="md:col-span-2">
            <Suspense fallback={<CashflowWidgetSkeleton />} key={`cashflow-${from}-${to}`}>
              <CashflowWidget from={from} to={to} currencyCode={primaryCurrencyCode || 'USD'} locale={languageLocale} />
            </Suspense>
          </div>
        </div>

        {/* Trend & Breakdown Row */}
        <div className="grid gap-6 grid-cols-1">
          {/* Net Worth Trend Chart */}
          <Suspense fallback={<BalanceTrendWidgetSkeleton className="col-span-full" />}>
            <BalanceTrendWidget from={from} to={to} className="col-span-full" dateFormatPreference={dateFormatPreference} currencyCode={primaryCurrencyCode || 'USD'} locale={languageLocale} />
          </Suspense>

          {/* Category Breakdown (Expenses) */}
          <Suspense fallback={<CategoryBreakdownWidgetSkeleton className="col-span-full" />}>
            <CategoryBreakdownWidget from={from} to={to} className="col-span-full" currencyCode={primaryCurrencyCode || 'USD'} locale={languageLocale} />
          </Suspense>
        </div>

        {/* Income vs Expenses & Wallet Balances Row */}
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-3">
          <Suspense fallback={<IncomeVsExpensesWidgetSkeleton className="xl:col-span-2" />} key={`income-${from}-${to}`}>
            <IncomeVsExpensesWidget from={from} to={to} className="xl:col-span-2" dateFormatPreference={dateFormatPreference} currencyCode={primaryCurrencyCode || 'USD'} locale={languageLocale} />
          </Suspense>
          <Suspense fallback={<WalletBalancesWidgetSkeleton />}>
            <WalletBalancesWidget locale={languageLocale} />
          </Suspense>
        </div>

        {/* Recent Transactions Row */}
        <div className="grid gap-6 grid-cols-1">
          <Suspense fallback={<RecentTransactionsWidgetSkeleton />}>
            <RecentTransactionsWidget dateFormatPreference={dateFormatPreference} locale={languageLocale} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
