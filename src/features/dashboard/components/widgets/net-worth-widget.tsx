import { fetchBalanceTrendAction } from '@/features/dashboard/actions';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';

import { formatCurrency } from '@/lib/formatters';
import { calculateComparePeriod } from '@/features/dashboard/utils';
import { PercentageBadge } from '@/components/ui/percentage-badge';

export async function NetWorthWidget({ from, to, currencyCode = 'USD', locale = 'en-US' }: { from: string, to: string, currencyCode?: string, locale?: string }) {
  const { compareFrom, compareTo } = calculateComparePeriod(from, to);
  
  const [trendRes, compareTrendRes] = await Promise.all([
    fetchBalanceTrendAction(from, to),
    fetchBalanceTrendAction(compareFrom, compareTo)
  ]);
  
  const trend = trendRes.success && trendRes.data ? trendRes.data : [];
  const compareTrend = compareTrendRes.success && compareTrendRes.data ? compareTrendRes.data : [];
  
  const balance = trend.length > 0 ? trend[trend.length - 1].balance : 0;
  const previousBalance = compareTrend.length > 0 ? compareTrend[compareTrend.length - 1].balance : 0;
  const { t } = await getTranslator();

  return (
    <WidgetCard 
      title={t('dashboard.widgets.net_worth')}
      className="bg-primary/5 border-primary/20"
    >
      <div className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
        {formatCurrency(balance, currencyCode, locale)}
      </div>
      <PercentageBadge current={balance} previous={previousBalance} label={t('dashboard.widgets.vs_previous')} />
    </WidgetCard>
  );
}

export function NetWorthWidgetSkeleton() {
  return <WidgetCardSkeleton className="bg-primary/5 border-primary/20" />;
}
