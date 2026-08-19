import { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DetailHeaderProps {
  backHref: string;
  title: string;
  subtitle?: ReactNode;
  icon?: React.ElementType;
  iconClassName?: string;
  iconStyle?: React.CSSProperties;
  badge?: ReactNode;
}

export function DetailHeader({
  backHref,
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  iconStyle,
  badge,
}: DetailHeaderProps) {
  return (
    <div className="mt-2 sm:mt-4 flex items-center space-x-3 sm:space-x-4">
      <Link href={backHref} className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'rounded-full h-8 w-8 sm:h-9 sm:w-9 shrink-0' })}>
        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </Link>
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {Icon && (
          <div className={cn("p-2 sm:p-2.5 rounded-xl bg-primary/10 text-primary shrink-0", iconClassName)} style={iconStyle}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight flex items-center gap-2 truncate">
            <span className="truncate">{title}</span>
            {badge}
          </h1>
          {subtitle && (
            <div className="text-xs sm:text-sm text-muted-foreground capitalize flex items-center gap-1.5 truncate">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

