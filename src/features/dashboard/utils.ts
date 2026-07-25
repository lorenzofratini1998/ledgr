import { subDays, subMonths, subYears, startOfYear, format } from 'date-fns';

import { cookies } from 'next/headers';

export async function parsePeriod(
  period: string | null | undefined,
  paramFrom?: string | null,
  paramTo?: string | null
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
    activePeriod = '30d';
  }

  if (activePeriod === 'custom' && activeFrom && activeTo) {
    return { from: activeFrom, to: activeTo, resolvedPeriod: 'custom' };
  }

  const to = new Date();
  let from = new Date();

  switch (activePeriod) {
    case '7d':
      from = subDays(to, 7);
      break;
    case '30d':
      from = subDays(to, 30);
      break;
    case '90d':
      from = subDays(to, 90);
      break;
    case '6m':
      from = subMonths(to, 6);
      break;
    case '1y':
      from = subYears(to, 1);
      break;
    case 'ytd':
      from = startOfYear(to);
      break;
    case 'custom':
    default:
      from = subDays(to, 30); // Default to 30d
      activePeriod = '30d';
      break;
  }

  // Format as YYYY-MM-DD
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
    resolvedPeriod: activePeriod,
  };
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
