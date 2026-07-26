import { subDays, parseISO, differenceInDays, format } from 'date-fns';
import { cookies } from 'next/headers';
import { getDateRangeForPeriod } from '@/lib/date-utils';

export async function parsePeriod(
  period: string | null | undefined,
  paramFrom?: string | null,
  paramTo?: string | null,
  defaultFallback?: string
): Promise<{ from: string; to: string; resolvedPeriod: string }> {
  const cookieStore = await cookies();

  let activePeriod = period;
  let activeFrom = paramFrom;
  let activeTo = paramTo;

  // Fallback to cookies if no URL param
  if (!activePeriod) {
    activePeriod = cookieStore.get('ledgr_period')?.value;
    activeFrom = cookieStore.get('ledgr_from')?.value;
    activeTo = cookieStore.get('ledgr_to')?.value;
  }

  if (!activePeriod) {
    activePeriod = defaultFallback || '30d';
  }

  if (activePeriod === 'custom' && activeFrom && activeTo) {
    return { from: activeFrom, to: activeTo, resolvedPeriod: 'custom' };
  }

  return getDateRangeForPeriod(activePeriod, defaultFallback);
}

export function flattenCategoriesForSelect(nestedCategories: any[]) {
  return nestedCategories.reduce((acc, cat) => {
    acc.push({ category_id: cat.category_id, category_name: cat.category_name });
    if (cat.children) {
      cat.children.forEach((child: any) => {
        acc.push({ category_id: child.category_id, category_name: `-- ${child.category_name}` });
      });
    }
    return acc;
  }, [] as { category_id: string; category_name: string }[]);
}

export function getDisplayName(user: any) {
  return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
}

export function calculateComparePeriod(from: string, to: string) {
  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  const daysDiff = differenceInDays(toDate, fromDate) + 1;

  const compareTo = subDays(fromDate, 1);
  const compareFrom = subDays(compareTo, daysDiff - 1);

  return {
    compareFrom: format(compareFrom, 'yyyy-MM-dd'),
    compareTo: format(compareTo, 'yyyy-MM-dd')
  };
}

export function mergeTrendData(currentTrend: any[], compareTrend: any[]) {
  return currentTrend.map((item, index) => {
    const compareItem = compareTrend[index];
    return {
      ...item,
      compareDay: compareItem?.day,
      compareBalance: compareItem ? Number(compareItem.balance) : undefined
    };
  });
}

