import { PageContainer } from '@/components/layout/page-container';
import { DetailHeader } from '@/components/shared/detail-header';
import { getBudgetById, getBudgetCategoryBreakdown, getBudgetDailyPacing } from '@/features/budgets/queries';
import { getTransactions } from '@/features/transactions/queries';
import { getCategories } from '@/features/categories/queries';
import { getTags } from '@/features/tags/queries';
import { getWallets } from '@/features/wallets/queries';
import { getActiveCurrencies } from '@/lib/constants/currencies';
import { getUserPreferences } from '@/features/preferences/queries';
import { getTranslator } from '@/i18n/server';
import { getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { BudgetKpiCards } from '@/features/budgets/components/budget-kpi-cards';
import { BudgetPacingChart } from '@/features/budgets/components/budget-pacing-chart';
import { BudgetCategoryProgress } from '@/features/budgets/components/budget-category-progress';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Receipt } from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { TransactionListItem } from '@/features/transactions/components/transaction-list-item';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { t } = await getTranslator();
  return {
    title: `${t('budgets.detailsTitle' as any)} | Ledgr`,
  };
}

export default async function BudgetDetailsPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await params;
  const budgetId = resolvedParams.id;
  const resolvedSearchParams = await searchParams;
  
  const { t } = await getTranslator();
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const pageSize = 10; // Smaller page size for the widget

  const [
    budget,
    breakdownData,
    pacingData,
    categories,
    tags,
    wallets,
    preferences,
    activeCurrencies
  ] = await Promise.all([
    getBudgetById(budgetId, user.id),
    getBudgetCategoryBreakdown(budgetId),
    getBudgetDailyPacing(budgetId),
    getCategories(user.id),
    getTags(user.id, { pageSize: 100 }),
    getWallets(user.id),
    getUserPreferences(user.id),
    getActiveCurrencies(),
  ]);

  const spentAmount = pacingData && pacingData.length > 0 
    ? pacingData[pacingData.length - 1].balance 
    : 0;

  if (!budget) {
    redirect('/budgets');
  }

  const primaryCurrencyCode = preferences?.primary_currency_code || 'USD';
  const dateFormat = preferences?.date_format || 'DD/MM/YYYY';

  // Filter transactions specifically for this budget
  const categoryIds = budget.is_global 
    ? undefined 
    : budget.budget_categories.map((bc: any) => bc.category_id);

  const { data: transactions, count: totalTransactions } = await getTransactions(user.id, {
    page,
    pageSize,
    startDate: budget.start_date,
    endDate: budget.end_date,
    categoryIds,
  });

  return (
    <PageContainer>
      <DetailHeader
        backHref="/budgets"
        title={budget.name}
        subtitle={t('budgets.detailsTitle' as any)}
      />

      <BudgetKpiCards 
        amount={budget.amount}
        spent={spentAmount}
        type={budget.type as 'expense' | 'income'}
        startDate={budget.start_date}
        endDate={budget.end_date}
        currencyCode={budget.currency_code || primaryCurrencyCode}
        todayDate={new Date().toISOString()}
      />

      <div className="flex flex-col gap-4 md:gap-6">
        <div>
          <BudgetPacingChart 
            data={pacingData.map((d: any) => ({ ...d, balance: budget.type === 'expense' ? Math.abs(d.balance) : d.balance }))}
            targetAmount={budget.amount}
            type={budget.type as 'expense' | 'income'}
            currencyCode={budget.currency_code || primaryCurrencyCode}
            dateFormatPreference={dateFormat}
          />
        </div>
        <div>
          {breakdownData && breakdownData.length > 0 ? (
            <BudgetCategoryProgress 
              data={breakdownData}
              type={budget.type as 'expense' | 'income'}
              currencyCode={budget.currency_code || primaryCurrencyCode}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6 sm:p-8 text-center rounded-xl border border-dashed bg-muted/20">
              <p className="text-xs sm:text-sm text-muted-foreground">{t('budgets.noCategoryData' as any)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-2 sm:pt-4">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h2 className="text-base sm:text-lg font-semibold">{t('budgets.recentTransactions' as any)}</h2>
          <Link href={`/transactions?${new URLSearchParams({
              startDate: budget.start_date,
              endDate: budget.end_date,
              type: budget.type,
              ...(categoryIds && categoryIds.length > 0 ? { categories: categoryIds.join(',') } : {})
            }).toString()}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            <span className="text-xs sm:text-sm">View All</span> <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="bg-card border rounded-xl p-3.5 sm:p-4 md:p-6">
            {(!transactions || transactions.length === 0) ? (
              <div className="text-center py-6 text-muted-foreground">
                 <Receipt className="mx-auto h-8 w-8 mb-2 opacity-20" />
                 <p className="text-xs sm:text-sm">{t('dashboard.widgets.no_transactions' as any) || 'No transactions yet'}</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {(transactions as any[]).slice(0, 5).map((tx: any) => (
                  <TransactionListItem 
                    key={tx.transaction_id} 
                    transaction={tx} 
                    dateFormatPreference={dateFormat} 
                    locale={'en-US'} 
                  />
                ))}
              </div>
            )}
        </div>
      </div>
    </PageContainer>
  );
}
