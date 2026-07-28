import { getRecurringHistory } from '@/features/recurring/queries';
import { RecurringHistoryChart } from './recurring-history-chart';
import { WidgetCardSkeleton } from '@/features/dashboard/components/widgets/widget-card';
import { getUser } from '@/lib/supabase/server';

interface RecurringHistoryWidgetProps {
  recurringId: string;
  className?: string;
  dateFormatPreference?: string;
  currencyCode?: string;
  locale?: string;
}

export async function RecurringHistoryWidget({ recurringId, className, dateFormatPreference = 'DD/MM/YYYY', currencyCode = 'USD', locale = 'en-US' }: RecurringHistoryWidgetProps) {
  const { data: { user } } = await getUser();
  if (!user) return null;

  const data = await getRecurringHistory(user.id, recurringId);

  return (
    <div className={className}>
      <RecurringHistoryChart data={data} dateFormatPreference={dateFormatPreference} currencyCode={currencyCode} locale={locale} />
    </div>
  );
}

export function RecurringHistoryWidgetSkeleton({ className }: { className?: string }) {
  return <WidgetCardSkeleton className={className} />;
}
