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
    <div className={cn("p-4 rounded-xl border bg-card shadow-sm", className)}>
      <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </p>
      <div className={cn("text-2xl font-bold tracking-tight", valueClassName)}>
        {value}
      </div>
    </div>
  );
}
