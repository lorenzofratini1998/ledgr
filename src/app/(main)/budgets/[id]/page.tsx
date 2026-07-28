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
    <div className="flex flex-col h-full space-y-6 pt-safe pb-safe pb-24 md:pb-6 px-4 md:px-8">
      <div className="flex items-center space-x-4 mt-4">
        <Link href="/budgets">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{budget.name}</h1>
          <p className="text-sm text-muted-foreground">
            {t('budgets.detailsTitle' as any)}
          </p>
        </div>
      </div>

      <BudgetKpiCards 
        amount={budget.amount}
        spent={spentAmount}
        type={budget.type as 'expense' | 'income'}
        startDate={budget.start_date}
        endDate={budget.end_date}
        currencyCode={budget.currency_code || primaryCurrencyCode}
        todayDate={new Date().toISOString()}
      />

      <div className="flex flex-col gap-6">
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
            <div className="h-full flex items-center justify-center p-8 text-center rounded-xl border border-dashed bg-muted/20">
              <p className="text-sm text-muted-foreground">{t('budgets.noCategoryData' as any)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{t('budgets.recentTransactions' as any)}</h2>
          <Link href={`/transactions?${new URLSearchParams({
              startDate: budget.start_date,
              endDate: budget.end_date,
              type: budget.type,
              ...(categoryIds && categoryIds.length > 0 ? { categories: categoryIds.join(',') } : {})
            }).toString()}`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
        <div className="bg-card border rounded-xl p-4 md:p-6">
            {(!transactions || transactions.length === 0) ? (
              <div className="text-center py-6 text-muted-foreground">
                 <Receipt className="mx-auto h-8 w-8 mb-2 opacity-20" />
                 <p>{t('dashboard.widgets.no_transactions' as any) || 'No transactions yet'}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(transactions as any[]).slice(0, 5).map((tx: any) => (
                  <div key={tx.transaction_id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" 
                        style={{ backgroundColor: tx.categories?.color || '#94a3b8' }}
                      >
                         <Receipt size={20} />
                      </div>
                      <div>
                        <p className="font-medium leading-none">{tx.description}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(tx.date, dateFormat)} • {tx.wallets?.name || 'Unknown Wallet'}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${tx.normalized_amount > 0 ? 'text-emerald-500' : ''}`}>
                      {tx.normalized_amount > 0 ? '+' : ''}
                      {formatCurrency(tx.amount, tx.currency_code, 'en-US')}
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
