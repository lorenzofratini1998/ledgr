import { getRecurringHistory } from '@/features/recurring/queries';
import { getUser } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/formatters';

interface TotalSpentKPIProps {
  recurringId: string;
  currencyCode: string;
  locale: string;
}

export async function TotalSpentKPI({ recurringId, currencyCode, locale }: TotalSpentKPIProps) {
  const { data: { user } } = await getUser();
  if (!user) return <>—</>;

  const data = await getRecurringHistory(user.id, recurringId);

  const totalSpent = data.reduce((acc: number, tx: { normalized_amount?: number; amount?: number }) => {
    return acc + Math.abs(Number(tx.normalized_amount || tx.amount || 0));
  }, 0);

  return <>{formatCurrency(totalSpent, currencyCode, locale)}</>;
}
