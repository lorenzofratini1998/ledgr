import { BudgetList } from '@/features/budgets/components/budget-list';
import { CreateBudgetTrigger } from '@/features/budgets/components/create-budget-trigger';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/shared/page-header';
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

  const trigger = (
    <CreateBudgetTrigger 
      categories={activeCategories} 
      currencyCode={primaryCurrencyCode}
      currencies={activeCurrencies as any[]}
    />
  );

  return (
    <PageContainer>
      <PageHeader 
        title={t('budgets.title')}
        description={t('budgets.description')}
        action={trigger}
      />

      <BudgetList 
        budgets={budgets as any[]} 
        categories={activeCategories}
        currencyCode={primaryCurrencyCode}
        currencies={activeCurrencies as any[]}
      />

      {/* Mobile trigger */}
      <div className="md:hidden">
        {trigger}
      </div>
    </PageContainer>
  );
}
