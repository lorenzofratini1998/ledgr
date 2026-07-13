import { CalendarClock } from 'lucide-react';

export function UpcomingList() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center md:hidden">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Netflix Subscription</span>
            <span className="text-xs text-muted-foreground">Tomorrow</span>
          </div>
        </div>
        <span className="text-sm font-semibold text-destructive">-$15.99</span>
      </div>

      <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center md:hidden">
            <CalendarClock className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Internet Bill</span>
            <span className="text-xs text-muted-foreground">In 3 days</span>
          </div>
        </div>
        <span className="text-sm font-semibold text-destructive">-$89.00</span>
      </div>
    </div>
  );
}
