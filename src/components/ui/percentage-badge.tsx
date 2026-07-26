import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PercentageBadgeProps {
  current: number;
  previous: number;
  className?: string;
  invertColors?: boolean; // For things like expenses where up is bad
  label?: string;
}

export function PercentageBadge({ current, previous, className, invertColors = false, label }: PercentageBadgeProps) {

  if (previous === 0) return null; // Avoid division by zero

  const percentage = ((current - previous) / Math.abs(previous)) * 100;
  const isPositive = percentage >= 0;
  
  let color = isPositive ? 'text-emerald-500' : 'text-rose-500';
  if (invertColors) {
    color = isPositive ? 'text-rose-500' : 'text-emerald-500';
  }

  const Icon = isPositive ? TrendingUp : TrendingDown;
  const formattedPercentage = Math.abs(percentage).toFixed(1);

  if (formattedPercentage === '0.0') return null; // Hide badge if there is no change

  return (
    <div className={cn('flex items-center text-xs mt-1', color, className)}>
      <Icon className="w-3 h-3 mr-1" />
      <span>
        {formattedPercentage}%{label ? ` ${label}` : ''}
      </span>
    </div>
  );
}
