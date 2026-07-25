'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

import { useTranslation } from '@/i18n/hooks/use-translation';

const PERIODS = [
  { value: '7d', translationKey: 'dashboard.periods.7d' },
  { value: '30d', translationKey: 'dashboard.periods.30d' },
  { value: '90d', translationKey: 'dashboard.periods.90d' },
  { value: '6m', translationKey: 'dashboard.periods.6m' },
  { value: '1y', translationKey: 'dashboard.periods.1y' },
  { value: 'ytd', translationKey: 'dashboard.periods.ytd' },
  { value: 'custom', translationKey: 'dashboard.periods.custom' },
];

interface PeriodSelectorProps {
  defaultPeriod?: string;
  defaultFrom?: string;
  defaultTo?: string;
}

export function PeriodSelector({ defaultPeriod = '30d', defaultFrom, defaultTo }: PeriodSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentPeriod = searchParams.get('period') || defaultPeriod;
  const paramFrom = searchParams.get('from') || defaultFrom;
  const paramTo = searchParams.get('to') || defaultTo;

  const [date, setDate] = useState<DateRange | undefined>(() => {
    if (paramFrom && paramTo) {
      return {
        from: parseISO(paramFrom),
        to: parseISO(paramTo)
      };
    }
    return undefined;
  });

  const { t } = useTranslation();

  const [tempDate, setTempDate] = useState<DateRange | undefined>(date);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Sync state with URL params when they change
  useEffect(() => {
    if (paramFrom && paramTo) {
      const newDate = {
        from: parseISO(paramFrom),
        to: parseISO(paramTo)
      };
      setDate(newDate);
      setTempDate(newDate);
    } else {
      setDate(undefined);
      setTempDate(undefined);
    }
  }, [paramFrom, paramTo]);

  const handlePeriodChange = useCallback(
    (value: string | null) => {
      if (!value) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set('period', value);
      
      // Save to cookie
      document.cookie = `ledgr_period=${value}; path=/; max-age=31536000`;
      document.cookie = `ledgr_from=; path=/; max-age=0`; // clear
      document.cookie = `ledgr_to=; path=/; max-age=0`;

      if (value !== 'custom') {
        params.delete('from');
        params.delete('to');
        setDate(undefined);
        setTempDate(undefined);
      } else {
        // if custom, open calendar
        setTempDate(date);
        setIsCalendarOpen(true);
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setTempDate(newDate);
  };

  const handleApplyCustomRange = () => {
    if (tempDate?.from && tempDate?.to) {
      setDate(tempDate);
      
      const fromStr = format(tempDate.from, 'yyyy-MM-dd');
      const toStr = format(tempDate.to, 'yyyy-MM-dd');
      
      // Save to cookie
      document.cookie = `ledgr_period=custom; path=/; max-age=31536000`;
      document.cookie = `ledgr_from=${fromStr}; path=/; max-age=31536000`;
      document.cookie = `ledgr_to=${toStr}; path=/; max-age=31536000`;

      const params = new URLSearchParams(searchParams.toString());
      params.set('period', 'custom');
      params.set('from', fromStr);
      params.set('to', toStr);
      
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
      <Select value={currentPeriod} onValueChange={handlePeriodChange}>
        <SelectTrigger className="w-full sm:w-[180px] bg-background">
          <SelectValue placeholder={t('dashboard.periods.select')}>
            {PERIODS.find(p => p.value === currentPeriod) ? t(PERIODS.find(p => p.value === currentPeriod)!.translationKey as any) : t('dashboard.periods.select')}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {t(p.translationKey as any)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {currentPeriod === 'custom' && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger render={
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full sm:w-[260px] justify-start text-left font-normal bg-background truncate",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} -{" "}
                    {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>{t('dashboard.periods.pick_date')}</span>
              )}
            </Button>
          } />
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={tempDate?.from}
              selected={tempDate}
              onSelect={handleDateSelect}
              numberOfMonths={2}
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
              endMonth={new Date(new Date().getFullYear() + 1, 11)}
            />
            <div className="p-3 border-t flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => {
                 setTempDate(date);
                 setIsCalendarOpen(false);
              }}>{t('dashboard.periods.cancel')}</Button>
              <Button size="sm" disabled={!tempDate?.from || !tempDate?.to} onClick={handleApplyCustomRange}>{t('dashboard.periods.apply')}</Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
