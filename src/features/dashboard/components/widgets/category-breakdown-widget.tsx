import { fetchCategoryBreakdownAction } from '@/features/dashboard/actions';
import { calculateComparePeriod } from '@/features/dashboard/utils';
import { CategoryBreakdownChart } from './category-breakdown-chart';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';
import { getUserPreferences } from '@/features/preferences/queries';
import { getUser } from '@/lib/supabase/server';

export async function CategoryBreakdownWidget({ from, to, walletId, categoryId, className, currencyCode = 'USD', locale = 'en-US' }: { from: string, to: string, walletId?: string, categoryId?: string, className?: string, currencyCode?: string, locale?: string }) {
  const { compareFrom, compareTo } = calculateComparePeriod(from, to);

  const [breakdownRes, compareBreakdownRes] = await Promise.all([
    fetchCategoryBreakdownAction(from, to, walletId, categoryId),
    fetchCategoryBreakdownAction(compareFrom, compareTo, walletId, categoryId)
  ]);
  
  const rawBreakdown = breakdownRes.success && breakdownRes.data ? breakdownRes.data : [];
  const rawCompareBreakdown = compareBreakdownRes.success && compareBreakdownRes.data ? compareBreakdownRes.data : [];
  
  const { t } = await getTranslator();
  
  const breakdown = rawBreakdown.map((b: any) => {
    const compareItem = rawCompareBreakdown.find((cb: any) => cb.category_id === b.category_id);
    return {
      ...b,
      category_id: b.category_id || 'uncategorized',
      category_name: b.category_name === 'Uncategorized' ? t('dashboard.widgets.uncategorized') : b.category_name,
      amount: Number(b.amount),
      compareAmount: compareItem ? Number(compareItem.amount) : 0
    };
  });

  return (
    <WidgetCard className={className}>
      <CategoryBreakdownChart data={breakdown} currencyCode={currencyCode} locale={locale} vsPreviousLabel={t('dashboard.widgets.vs_previous')} />
    </WidgetCard>
  );
}

export function CategoryBreakdownWidgetSkeleton({ className }: { className?: string }) {
  return <WidgetCardSkeleton className={className} />;
}
