import { fetchCategoryBreakdownAction } from '@/features/dashboard/actions';
import { CategoryBreakdownChart } from './category-breakdown-chart';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';
import { getUserPreferences } from '@/features/preferences/queries';
import { getUser } from '@/lib/supabase/server';

export async function CategoryBreakdownWidget({ from, to, walletId, categoryId, className }: { from: string, to: string, walletId?: string, categoryId?: string, className?: string }) {
  const breakdownRes = await fetchCategoryBreakdownAction(from, to, walletId, categoryId);
  const rawBreakdown = breakdownRes.success && breakdownRes.data ? breakdownRes.data : [];
  const { t } = await getTranslator();
  
  const { data: { user } } = await getUser();
  const prefs = user ? await getUserPreferences(user.id) : null;

  const breakdown = rawBreakdown.map((b: any) => ({
    ...b,
    amount: Number(b.amount)
  }));

  return (
    <WidgetCard title={t('dashboard.widgets.category_breakdown')} className={className}>
      <CategoryBreakdownChart data={breakdown} currencyCode={prefs?.primary_currency_code || 'USD'} />
    </WidgetCard>
  );
}

export function CategoryBreakdownWidgetSkeleton({ className }: { className?: string }) {
  return <WidgetCardSkeleton className={className} />;
}
