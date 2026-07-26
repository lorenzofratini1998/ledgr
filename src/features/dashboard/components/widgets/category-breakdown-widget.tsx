import { fetchCategoryBreakdownAction } from '@/features/dashboard/actions';
import { CategoryBreakdownChart } from './category-breakdown-chart';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';
import { getUserPreferences } from '@/features/preferences/queries';
import { getUser } from '@/lib/supabase/server';

export async function CategoryBreakdownWidget({ from, to, walletId, categoryId, className, currencyCode = 'USD', locale = 'en-US' }: { from: string, to: string, walletId?: string, categoryId?: string, className?: string, currencyCode?: string, locale?: string }) {
  const breakdownRes = await fetchCategoryBreakdownAction(from, to, walletId, categoryId);
  const rawBreakdown = breakdownRes.success && breakdownRes.data ? breakdownRes.data : [];
  const { t } = await getTranslator();
  
  const breakdown = rawBreakdown.map((b: any) => ({
    ...b,
    category_id: b.category_id || 'uncategorized',
    category_name: b.category_name === 'Uncategorized' ? t('dashboard.widgets.uncategorized') : b.category_name,
    amount: Number(b.amount)
  }));

  return (
    <WidgetCard title={t('dashboard.widgets.category_breakdown')} className={className}>
      <CategoryBreakdownChart data={breakdown} currencyCode={currencyCode} locale={locale} />
    </WidgetCard>
  );
}

export function CategoryBreakdownWidgetSkeleton({ className }: { className?: string }) {
  return <WidgetCardSkeleton className={className} />;
}
