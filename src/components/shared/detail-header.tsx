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
    <div className="mt-4 flex items-center space-x-4">
      <Link href={backHref} className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'rounded-full' })}>
        <ArrowLeft className="w-5 h-5" />
      </Link>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn("p-2.5 rounded-xl bg-primary/10 text-primary shrink-0", iconClassName)} style={iconStyle}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            {title}
            {badge}
          </h1>
          {subtitle && (
            <div className="text-sm text-muted-foreground capitalize flex items-center gap-1.5">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
