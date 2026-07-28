'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { formatCurrency } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { calculateCategoryPercentage } from '../utils';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

interface CategoryBreakdownItem {
  category_id: string;
  category_name: string;
  color: string;
  icon: string;
  amount: number;
  compareAmount: number; // For budgets, this is the allocation_amount
}

interface BudgetCategoryProgressProps {
  data: CategoryBreakdownItem[];
  type: 'expense' | 'income';
  currencyCode?: string;
  locale?: string;
  className?: string;
}

export function BudgetCategoryProgress({
  data,
  type,
  className,
  currencyCode = 'USD',
  locale = 'en-US'
}: BudgetCategoryProgressProps) {
  const { t } = useTranslation();

  // Sort: allocated categories first, then by highest spend
  const sortedData = [...data].sort((a, b) => {
    if (a.compareAmount > 0 && b.compareAmount === 0) return -1;
    if (b.compareAmount > 0 && a.compareAmount === 0) return 1;
    return b.amount - a.amount;
  });

  if (sortedData.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center py-10", className)}>
        <p className="text-muted-foreground">{t('dashboard.widgets.no_data' as any) || 'No data available'}</p>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-semibold">{t('categories.title' as any) || 'Categories'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sortedData.map((item) => {
          const IconComponent = (LucideIcons as any)[item.icon || 'HelpCircle'] || HelpCircle;
          
          const spent = Math.abs(item.amount);
          const allocated = Number(item.compareAmount) || 0;
          const hasAllocation = allocated > 0;
          
          const isOverbudget = type === 'expense' && hasAllocation && spent > allocated;
          const percentage = calculateCategoryPercentage(spent, allocated);
          
          return (
            <div key={item.category_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="flex h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${item.color}20` }}
                  >
                    <IconComponent className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <span className="font-medium text-sm">{item.category_name}</span>
                </div>
                
                <div className="text-right flex flex-col justify-end">
                  <div>
                    <span className={cn("text-sm font-semibold", isOverbudget ? "text-destructive" : "")}>
                      {formatCurrency(spent, currencyCode, locale)}
                    </span>
                    {hasAllocation && (
                      <span className="text-xs text-muted-foreground ml-1">
                        / {formatCurrency(allocated, currencyCode, locale)}
                      </span>
                    )}
                  </div>
                  {hasAllocation && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {isOverbudget ? (
                        <span className="text-destructive font-medium">
                          {((spent / allocated) * 100).toFixed(0)}% • {formatCurrency(spent - allocated, currencyCode, locale)} over
                        </span>
                      ) : (
                        <span>
                          {percentage.toFixed(0)}% • {formatCurrency(allocated - spent, currencyCode, locale)} left
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {hasAllocation && (
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all", isOverbudget ? "bg-destructive" : "bg-primary")}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
