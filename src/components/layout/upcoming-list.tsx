"use client";

import { CalendarClock } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { parseISO, formatDistanceToNowStrict, isToday, isTomorrow, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSchedule } from './schedule-context';

interface UpcomingListProps {
  payments?: any[];
  dateFormatPreference?: string;
}

function getRelativeDateText(dateStr: string, dateFormatPreference: string) {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  
  // If it's within the next 7 days, show relative time
  const diffDays = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
  if (diffDays <= 7 && diffDays > 0) {
    return `In ${diffDays} days`;
  }
  
  return formatDate(dateStr, dateFormatPreference);
}

export function UpcomingList({ payments = [], dateFormatPreference = 'DD/MM/YYYY' }: UpcomingListProps) {
  const { selectedDate } = useSchedule();

  const filteredPayments = selectedDate 
    ? payments.filter(p => isSameDay(parseISO(p.next_execution_date), selectedDate))
    : payments.slice(0, 5); // Default to next 5 if no date is explicitly selected (or today)

  if (filteredPayments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center px-4 border border-border/50 rounded-lg bg-card">
        <CalendarClock className="h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-sm font-medium">No upcoming payments</p>
        <p className="text-xs text-muted-foreground mt-1">
          {selectedDate ? "You have no payments scheduled for this date." : "Enjoy your free time!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredPayments.map((rp) => (
        <div key={rp.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate">{rp.description}</span>
              <span className="text-xs text-muted-foreground truncate">
                {getRelativeDateText(rp.next_execution_date, dateFormatPreference)}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 pl-2">
            <span className={cn(
              "text-sm font-semibold whitespace-nowrap",
              rp.amount < 0 ? "text-destructive" : "text-emerald-500"
            )}>
              {rp.amount > 0 ? "+" : ""}{formatCurrency(rp.amount, rp.currency_code)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
