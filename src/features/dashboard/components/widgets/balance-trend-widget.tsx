import { fetchBalanceTrendAction } from '@/features/dashboard/actions';
import { BalanceTrendChart } from './balance-trend-chart';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';

export async function BalanceTrendWidget({ from, to, walletId, categoryId, className, dateFormatPreference = 'DD/MM/YYYY', currencyCode = 'USD', locale = 'en-US' }: { from: string, to: string, walletId?: string, categoryId?: string, className?: string, dateFormatPreference?: string, currencyCode?: string, locale?: string }) {
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
      <BalanceTrendChart data={trend} dateFormatPreference={dateFormatPreference} currencyCode={currencyCode} locale={locale} />
    </WidgetCard>
  );
}

export function BalanceTrendWidgetSkeleton({ categoryId, className }: { categoryId?: string, className?: string }) {
  return <WidgetCardSkeleton className={className} />;
}
