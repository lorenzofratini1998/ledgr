'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/i18n/hooks/use-translation';
import { formatCurrency } from '@/lib/formatters';
import { Target, TrendingDown, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { calculatePacingTarget } from '../utils';
import { cn } from '@/lib/utils';
import { differenceInDays, isFuture } from 'date-fns';

interface BudgetKpiCardsProps {
  amount: number;
  spent: number;
  type: 'expense' | 'income';
  startDate: string;
  endDate: string;
  currencyCode: string;
  locale?: string;
  todayDate: string;
}

export function BudgetKpiCards({ amount, spent, type, startDate, endDate, currencyCode, locale = 'en-US', todayDate }: BudgetKpiCardsProps) {
  const { t } = useTranslation();
  
  const numAmount = Number(amount) || 0;
  const numSpent = Number(spent) || 0;
  
  const absoluteSpent = Math.abs(numSpent);
  const isOverbudget = type === 'expense' ? absoluteSpent > numAmount : false;
  const isGoalReached = type === 'income' ? absoluteSpent >= numAmount : false;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date(todayDate);
  const pacingAmount = calculatePacingTarget(numAmount, start, end, today);
  
  const totalDays = Math.max(1, differenceInDays(end, start));
  const daysPassed = Math.max(0, Math.min(totalDays, differenceInDays(today, start)));
  
  const percentageTime = (daysPassed / totalDays) * 100;
  const percentageAmount = numAmount > 0 ? (absoluteSpent / numAmount) * 100 : 0;
  
  let statusText = t('budgets.onTrack' as any);
  let statusIcon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
  let statusColor = "text-emerald-500";
  
  if (type === 'expense' && percentageAmount > percentageTime && !isOverbudget) {
    statusText = t('budgets.offTrack' as any);
    statusIcon = <AlertCircle className="h-5 w-5 text-amber-500" />;
    statusColor = "text-amber-500";
  } else if (type === 'expense' && isOverbudget) {
    statusText = t('budgets.overbudget' as any);
    statusIcon = <AlertCircle className="h-5 w-5 text-destructive" />;
    statusColor = "text-destructive";
  } else if (type === 'income' && isGoalReached) {
    statusText = t('budgets.goalReached' as any);
    statusIcon = <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    statusColor = "text-emerald-500";
  } else if (type === 'income' && percentageAmount < percentageTime && !isGoalReached) {
    statusText = t('budgets.offTrack' as any);
    statusIcon = <AlertCircle className="h-5 w-5 text-amber-500" />;
    statusColor = "text-amber-500";
  }

  const remainingAmount = type === 'expense' 
    ? Math.max(0, numAmount - absoluteSpent)
    : Math.max(0, numAmount - absoluteSpent);
  
  const overAmount = absoluteSpent > numAmount ? absoluteSpent - numAmount : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      <Card>
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center space-x-2 text-muted-foreground mb-1.5 sm:mb-2">
            <Target className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-medium">{type === 'expense' ? t('budgets.limit' as any) : t('budgets.target' as any)}</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold tracking-tight">
            {formatCurrency(numAmount, currencyCode, locale)}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center space-x-2 text-muted-foreground mb-1.5 sm:mb-2">
            {type === 'expense' ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
            <span className="text-xs sm:text-sm font-medium">{t('budgets.current' as any)}</span>
          </div>
          <div className={cn("text-xl sm:text-2xl font-bold tracking-tight", type === 'expense' && isOverbudget ? "text-destructive" : type === 'income' && isGoalReached ? "text-emerald-500" : "")}>
            {formatCurrency(absoluteSpent, currencyCode, locale)}
          </div>
        </CardContent>
      </Card>

      <Card className="sm:col-span-2 md:col-span-1">
        <CardContent className="p-4 sm:p-5 md:p-6">
          <div className="flex items-center space-x-2 text-muted-foreground mb-1.5 sm:mb-2">
            {statusIcon}
            <span className="text-xs sm:text-sm font-medium">
              {type === 'expense' ? 'Remaining' : 'Remaining to goal'}
            </span>
          </div>
          <div className={cn("text-xl sm:text-2xl font-bold tracking-tight", isOverbudget && type === 'expense' ? "text-destructive" : statusColor)}>
            {isOverbudget && type === 'expense' 
              ? `-${formatCurrency(overAmount, currencyCode, locale)}`
              : formatCurrency(remainingAmount, currencyCode, locale)}
          </div>
          <div className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-1">
            <span className={statusColor}>{statusText}</span>
            <span className="opacity-50">•</span>
            <span>{daysPassed} / {totalDays} {t('common.days' as any) || 'days'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

