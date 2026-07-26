import { fetchMonthlyCashflowAction } from '@/features/dashboard/actions';
import { IncomeVsExpensesChart } from './income-vs-expenses-chart';
import { WidgetCard, WidgetCardSkeleton } from './widget-card';
import { getTranslator } from '@/i18n/server';

export async function IncomeVsExpensesWidget({ from, to, walletId, categoryId, className, dateFormatPreference = 'DD/MM/YYYY', currencyCode = 'USD', locale = 'en-US' }: { from: string, to: string, walletId?: string, categoryId?: string, className?: string, dateFormatPreference?: string, currencyCode?: string, locale?: string }) {
  const res = await fetchMonthlyCashflowAction(from, to, walletId, categoryId);
  const rawData = res.success && res.data ? res.data : [];
  const { t } = await getTranslator();
  
  // Convert string numbers to numbers for Recharts
  const data = rawData.map((d: any) => ({
    ...d,
    income: Number(d.income),
    expense: Math.abs(Number(d.expense)) // Ensure positive for chart rendering if needed, though Recharts handles negatives
  }));

  return (
    <WidgetCard title={t('dashboard.widgets.income_vs_expenses')} className={className}>
      <IncomeVsExpensesChart data={data} dateFormatPreference={dateFormatPreference} currencyCode={currencyCode} locale={locale} />
    </WidgetCard>
  );
}

export function IncomeVsExpensesWidgetSkeleton({ className }: { className?: string }) {
  return <WidgetCardSkeleton className={className} />;
}
