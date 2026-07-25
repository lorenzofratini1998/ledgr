import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface WidgetCardProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
}

export function WidgetCard({ title, description, headerRight, children, className, contentClassName, headerClassName }: WidgetCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      {(title || description || headerRight) && (
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", headerClassName)}>
          <div>
            {title && <CardTitle className="text-sm font-medium">{title}</CardTitle>}
            {description && <CardDescription className="text-xs mt-1">{description}</CardDescription>}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}

export function WidgetCardSkeleton({ className, headerClassName, contentClassName, hasTitle = true, children }: { className?: string, headerClassName?: string, contentClassName?: string, hasTitle?: boolean, children?: React.ReactNode }) {
  return (
    <Card className={cn("animate-pulse h-full", className)}>
      {hasTitle && (
        <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", headerClassName)}>
          <div className="h-4 w-24 bg-muted/50 rounded"></div>
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children || <div className="h-9 w-32 bg-muted/50 rounded mt-2"></div>}
      </CardContent>
    </Card>
  );
}
