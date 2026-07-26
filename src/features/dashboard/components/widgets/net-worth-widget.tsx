import { fetchBalanceTrendAction } from '@/features/dashboard/actions';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';

import { formatCurrency } from '@/lib/formatters';

export async function NetWorthWidget({ from, to, currencyCode = 'USD', locale = 'en-US' }: { from: string, to: string, currencyCode?: string, locale?: string }) {
  const trendRes = await fetchBalanceTrendAction(from, to);
  const trend = trendRes.success && trendRes.data ? trendRes.data : [];
  const balance = trend.length > 0 ? trend[trend.length - 1].balance : 0;
  const { t } = await getTranslator();

  return (
    <WidgetCard 
      title={t('dashboard.widgets.net_worth')}
      className="bg-primary/5 border-primary/20"
    >
      <div className="text-3xl font-bold text-primary">
        {formatCurrency(balance, currencyCode, locale)}
      </div>
    </WidgetCard>
  );
}

export function NetWorthWidgetSkeleton() {
  return <WidgetCardSkeleton className="bg-primary/5 border-primary/20" />;
}
