import { subDays, subMonths, subYears, startOfYear, format } from 'date-fns';

export function getDateRangeForPeriod(activePeriod: string, defaultFallback: string = '30d') {
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
      from = subDays(to, 30); // Default custom error fallback
      activePeriod = defaultFallback || '30d';
      break;
  }

  // Format as YYYY-MM-DD
  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
    resolvedPeriod: activePeriod,
  };
}
