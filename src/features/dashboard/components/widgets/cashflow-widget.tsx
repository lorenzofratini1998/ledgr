import { fetchCashflowAction } from '@/features/dashboard/actions';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';

export async function CashflowWidget({ from, to }: { from: string, to: string }) {
  const cashflowRes = await fetchCashflowAction(from, to);
  const cashflow = cashflowRes.success && cashflowRes.data ? cashflowRes.data : { income: 0, expense: 0, net: 0 };
  const { t } = await getTranslator();

  return (
    <div className="grid grid-cols-2 gap-4">
      <WidgetCard 
        title={<span className="text-muted-foreground">{t('dashboard.widgets.income_in_period')}</span>}
        className="bg-card"
      >
        <div className="text-2xl font-semibold text-emerald-500">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(cashflow.income)}
        </div>
      </WidgetCard>
      
      <WidgetCard 
        title={<span className="text-muted-foreground">{t('dashboard.widgets.expenses_in_period')}</span>}
        className="bg-card"
      >
        <div className="text-2xl font-semibold text-rose-500">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(Math.abs(cashflow.expense))}
        </div>
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
