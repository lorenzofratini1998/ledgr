"use client";

import { Calendar } from "@/components/ui/calendar";
import { parseISO } from "date-fns";
import { useSchedule } from "./schedule-context";

interface CalendarWidgetProps {
  payments: any[];
}

export function CalendarWidget({ payments }: CalendarWidgetProps) {
  const { selectedDate, setSelectedDate } = useSchedule();

  // Convert payment next_execution_date to JS Date objects
  const paymentDates = payments.map(p => parseISO(p.next_execution_date));

  return (
    <div className="flex justify-center w-full">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="border border-border/50 rounded-xl bg-card shadow-sm p-4 w-fit"
        classNames={{
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
        }}
        modifiers={{
          hasPayment: paymentDates,
        }}
        modifiersClassNames={{
          hasPayment: 'bg-primary/10 text-primary font-semibold ring-1 ring-primary/20',
        }}
      />
    </div>
  );
}
