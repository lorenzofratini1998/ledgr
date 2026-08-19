import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex flex-col h-full space-y-4 md:space-y-6 pt-safe pb-safe pb-20 md:pb-6 px-3.5 sm:px-6 md:px-8 max-w-7xl mx-auto w-full", className)}>
      {children}
    </div>
  );
}

