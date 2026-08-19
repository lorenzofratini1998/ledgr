import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: ReactNode;
  icon?: React.ElementType;
  className?: string;
  valueClassName?: string;
}

export function KpiCard({ label, value, icon: Icon, className, valueClassName }: KpiCardProps) {
  return (
    <div className={cn("p-3.5 sm:p-4 rounded-xl border bg-card shadow-2xs", className)}>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1 flex items-center gap-1.5 font-medium">
        {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />}
        {label}
      </p>
      <div className={cn("text-xl sm:text-2xl font-bold tracking-tight", valueClassName)}>
        {value}
      </div>
    </div>
  );
}

