import { BudgetList } from '@/features/budgets/components/budget-list';
import { CreateBudgetTrigger } from '@/features/budgets/components/create-budget-trigger';
import { getBudgets } from '@/features/budgets/queries';
import { getCategories } from '@/features/categories/queries';
import { getUserPreferences } from '@/features/preferences/queries';
import { getActiveCurrencies } from '@/lib/constants/currencies';
import { getTranslator } from '@/i18n/server';
import { getUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function generateMetadata() {
  const { t } = await getTranslator();
  return {
    title: `${t('budgets.title')} | Ledgr`,
    description: t('budgets.description'),
  };
}

export default async function BudgetsPage() {
  const { t } = await getTranslator();
  const { data: { user } } = await getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Fetch budgets, categories and preferences in parallel for performance
  const [budgets, categories, preferences] = await Promise.all([
    getBudgets(user.id),
    getCategories(user.id),
    getUserPreferences(user.id),
  ]);
  
  const activeCurrencies = await getActiveCurrencies();
  const primaryCurrencyCode = preferences?.primary_currency_code || 'USD';
  const primaryCurrencySymbol = activeCurrencies.find((c: any) => c.iso_code === primaryCurrencyCode)?.symbol || '$';
  
  // We want all active categories for the budget wizard
  const activeCategories = categories.filter(c => c.is_active);

  return (
    <div className="flex flex-col h-full space-y-6 pt-safe pb-safe pb-24 md:pb-6 px-4 md:px-8">
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t('budgets.title')}</h1>
          <p className="text-sm text-muted-foreground">
            {t('budgets.description')}
          </p>
        </div>
        <div className="hidden md:block">
          <CreateBudgetTrigger 
            categories={activeCategories} 
            currencyCode={primaryCurrencyCode}
            currencies={activeCurrencies as any[]}
          />
        </div>
      </div>

      <BudgetList 
        budgets={budgets as any[]} 
        categories={activeCategories}
        currencyCode={primaryCurrencyCode}
        currencies={activeCurrencies as any[]}
      />

      {/* Mobile trigger */}
      <div className="md:hidden">
        <CreateBudgetTrigger 
          categories={activeCategories} 
          currencyCode={primaryCurrencyCode}
          currencies={activeCurrencies as any[]}
        />
      </div>
    </div>
  );
}
