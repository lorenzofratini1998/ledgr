import { fetchCashflowAction } from '@/features/dashboard/actions';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';

import { formatCurrency } from '@/lib/formatters';
import { calculateComparePeriod } from '@/features/dashboard/utils';
import { PercentageBadge } from '@/components/ui/percentage-badge';

export async function CashflowWidget({ from, to, currencyCode = 'USD', locale = 'en-US' }: { from: string, to: string, currencyCode?: string, locale?: string }) {
  const { compareFrom, compareTo } = calculateComparePeriod(from, to);

  const [cashflowRes, compareCashflowRes] = await Promise.all([
    fetchCashflowAction(from, to),
    fetchCashflowAction(compareFrom, compareTo)
  ]);

  const cashflow = cashflowRes.success && cashflowRes.data ? cashflowRes.data : { income: 0, expense: 0, net: 0 };
  const compareCashflow = compareCashflowRes.success && compareCashflowRes.data ? compareCashflowRes.data : { income: 0, expense: 0, net: 0 };
  const { t } = await getTranslator();

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      <WidgetCard 
        title={<span className="text-muted-foreground">{t('dashboard.widgets.income_in_period')}</span>}
        className="bg-card"
      >
        <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-emerald-500">
          {formatCurrency(cashflow.income, currencyCode, locale)}
        </div>
        <PercentageBadge current={cashflow.income} previous={compareCashflow.income} label={t('dashboard.widgets.vs_previous')} />
      </WidgetCard>
      
      <WidgetCard 
        title={<span className="text-muted-foreground">{t('dashboard.widgets.expenses_in_period')}</span>}
        className="bg-card"
      >
        <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-rose-500">
          {formatCurrency(Math.abs(cashflow.expense), currencyCode, locale)}
        </div>
        <PercentageBadge current={Math.abs(cashflow.expense)} previous={Math.abs(compareCashflow.expense)} invertColors label={t('dashboard.widgets.vs_previous')} />
      </WidgetCard>
    </div>
  );
}

export function CashflowWidgetSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <WidgetCardSkeleton className="bg-card" />
      <WidgetCardSkeleton className="bg-card" />
    </div>
  );
}
