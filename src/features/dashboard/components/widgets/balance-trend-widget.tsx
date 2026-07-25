import { fetchBalanceTrendAction } from '@/features/dashboard/actions';
import { BalanceTrendChart } from './balance-trend-chart';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';

export async function BalanceTrendWidget({ from, to, walletId, categoryId, className }: { from: string, to: string, walletId?: string, categoryId?: string, className?: string }) {
  const trendRes = await fetchBalanceTrendAction(from, to, walletId, categoryId);
  const rawTrend = trendRes.success && trendRes.data ? trendRes.data : [];
  const { t } = await getTranslator();

  const trend = rawTrend.map((tr: any) => ({
    ...tr,
    balance: Number(tr.balance)
  }));

  const title = categoryId ? t('dashboard.widgets.cashflow_trend') : t('dashboard.widgets.balance_trend');

  return (
    <WidgetCard title={title} className={className}>
      <BalanceTrendChart data={trend} />
    </WidgetCard>
  );
}

export function BalanceTrendWidgetSkeleton({ categoryId, className }: { categoryId?: string, className?: string }) {
  return <WidgetCardSkeleton className={className} />;
}
